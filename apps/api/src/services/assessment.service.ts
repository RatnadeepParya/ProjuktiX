import { db } from '../config/firebase.js';
import {
  AssessmentAttempt,
  AssessmentSet,
  Certificate,
  MCQAnswerKey,
  MCQQuestion,
  UserLearningProgress,
} from '@projuktix/types';
import { NotFoundError, scoreAssessment } from '@projuktix/shared';

export class AssessmentService {
  /**
   * Fetches an assessment set definition.
  /**
   * Lists published assessment sets, optionally filtered by technology ID.
   */
  static async listAssessmentSets(technologyId?: string): Promise<AssessmentSet[]> {
    let query: FirebaseFirestore.Query = db.collection('assessmentSets');
    if (technologyId) {
      query = query.where('technologyId', '==', technologyId);
    }
    const snap = await query.where('status', '==', 'published').get();
    return snap.docs.map((d) => d.data() as AssessmentSet);
  }

  /**
   * Fetches an assessment set definition.
   */
  static async getAssessmentSet(idOrSlug: string): Promise<AssessmentSet> {
    let doc = await db.collection('assessmentSets').doc(idOrSlug).get();
    if (!doc.exists) {
      const snap = await db.collection('assessmentSets').where('slug', '==', idOrSlug).limit(1).get();
      if (snap.empty) {
        throw new NotFoundError('AssessmentSet', idOrSlug);
      }
      doc = snap.docs[0]!;
    }
    return doc.data() as AssessmentSet;
  }

  /**
   * Starts a test attempt.
   * Returns:
   * 1. attemptId
   * 2. The questions with options and prompts, STRICTLY WITHOUT ANY ANSWER KEYS.
   */
  static async startAssessment(
    userId: string,
    assessmentSetId: string
  ): Promise<{ attempt: AssessmentAttempt; questions: MCQQuestion[] }> {
    const assessment = await this.getAssessmentSet(assessmentSetId);

    // Fetch questions in the assessment
    const questionDocs = await Promise.all(
      assessment.questionIds.map((qid) => db.collection('mcqQuestions').doc(qid).get())
    );

    const questions: MCQQuestion[] = [];
    for (const qDoc of questionDocs) {
      if (qDoc.exists) {
        const q = qDoc.data() as MCQQuestion;
        // Strictly sanitize: ensure no internal answer references are present
        questions.push({
          id: q.id,
          technologyId: q.technologyId,
          versionId: q.versionId,
          courseId: q.courseId,
          topicId: q.topicId,
          subtopicId: q.subtopicId,
          questionType: q.questionType,
          promptMarkdown: q.promptMarkdown,
          codeSnippet: q.codeSnippet,
          options: q.options.map((opt) => ({
            id: opt.id,
            text: opt.text,
            codeSnippet: opt.codeSnippet,
          })),
          difficulty: q.difficulty,
          tags: q.tags,
          estimatedSeconds: q.estimatedSeconds,
          status: q.status,
          createdAt: q.createdAt,
          updatedAt: q.updatedAt,
        });
      }
    }

    const attemptRef = db.collection('assessmentAttempts').doc();
    const attempt: AssessmentAttempt = {
      id: attemptRef.id,
      userId,
      assessmentSetId: assessment.id,
      technologyId: assessment.technologyId,
      startedAt: new Date().toISOString(),
      timeSpentSeconds: 0,
      status: 'in_progress',
      totalQuestions: questions.length,
      responses: {},
    };

    await attemptRef.set(attempt);

    return { attempt, questions };
  }

  /**
   * Evaluates submitted responses against the protected `mcqAnswerKeys` collection.
   */
  static async submitAssessment(input: {
    attemptId: string;
    userId: string;
    responses: Record<string, string[]>;
    timeSpentSeconds: number;
  }): Promise<{ attempt: AssessmentAttempt; certificate?: Certificate }> {
    const { attemptId, userId, responses, timeSpentSeconds } = input;

    const attemptDoc = await db.collection('assessmentAttempts').doc(attemptId).get();
    if (!attemptDoc.exists) {
      throw new NotFoundError('AssessmentAttempt', attemptId);
    }

    const attempt = attemptDoc.data() as AssessmentAttempt;
    if (attempt.userId !== userId) {
      throw new Error('Unauthorized attempt submission');
    }

    const assessment = await this.getAssessmentSet(attempt.assessmentSetId);

    // Fetch questions
    const questionDocs = await Promise.all(
      assessment.questionIds.map((qid) => db.collection('mcqQuestions').doc(qid).get())
    );
    const questions: MCQQuestion[] = questionDocs
      .filter((d) => d.exists)
      .map((d) => d.data() as MCQQuestion);

    // Fetch PROTECTED answer keys from `mcqAnswerKeys`
    const keyDocs = await Promise.all(
      assessment.questionIds.map((qid) => db.collection('mcqAnswerKeys').doc(qid).get())
    );

    const answerKeys: Record<string, MCQAnswerKey> = {};
    for (const kDoc of keyDocs) {
      if (kDoc.exists) {
        answerKeys[kDoc.id] = kDoc.data() as MCQAnswerKey;
      }
    }

    // Evaluate score server-side
    const evaluation = scoreAssessment({
      responses,
      questions,
      answerKeys,
      passPercentage: assessment.passPercentage,
      negativeMarkingRate: assessment.negativeMarkingRate,
    });

    const now = new Date().toISOString();
    const evaluatedAttempt: AssessmentAttempt = {
      ...attempt,
      submittedAt: now,
      timeSpentSeconds,
      status: 'completed',
      responses,
      score: evaluation.score,
      rawScore: evaluation.rawScore,
      maxScore: evaluation.maxScore,
      passed: evaluation.passed,
      weakTopicIds: evaluation.weakTopicIds,
      evaluatedBreakdown: evaluation.breakdown,
    };

    await db.collection('assessmentAttempts').doc(attemptId).set(evaluatedAttempt);

    // Update user learning progress in Firestore
    const progressRef = db.collection('learningProgress').doc(`${userId}_${assessment.technologyId}`);
    const progressDoc = await progressRef.get();
    if (progressDoc.exists) {
      const current = progressDoc.data() as UserLearningProgress;
      const passedList = new Set(current.passedAssessmentIds || []);
      if (evaluation.passed) {
        passedList.add(assessment.id);
      }
      await progressRef.update({
        passedAssessmentIds: Array.from(passedList),
        totalMinutesSpent: (current.totalMinutesSpent || 0) + Math.ceil(timeSpentSeconds / 60),
        updatedAt: now,
      });
    }

    // Issue certificate if mock exam and passed
    let issuedCert: Certificate | undefined;
    if (evaluation.passed && assessment.isMockExam) {
      const certRef = db.collection('certificates').doc();
      const userDoc = await db.collection('users').doc(userId).get();
      const userName = userDoc.exists ? userDoc.data()?.displayName || 'Learner' : 'Learner';

      const techDoc = await db.collection('technologies').doc(assessment.technologyId).get();
      const techName = techDoc.exists ? techDoc.data()?.name || 'Technology' : 'Technology';

      const certNumber = `PJX-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      issuedCert = {
        id: certRef.id,
        certificateNumber: certNumber,
        userId,
        recipientName: userName,
        technologyId: assessment.technologyId,
        technologyName: techName,
        assessmentSetId: assessment.id,
        assessmentTitle: assessment.title,
        assessmentAttemptId: attemptId,
        score: evaluation.score,
        passPercentage: assessment.passPercentage,
        issuedAt: now,
        verificationUrl: `/verify/${certRef.id}`,
        issuer: {
          organization: 'ProjuktiX Open Source Foundation',
          platform: 'ProjuktiX Technical Learning Ecosystem',
          disclaimer:
            'This certificate validates technical skill proficiency achieved via rigorous assessment on ProjuktiX. It is not an official vendor examination.',
        },
      };

      await certRef.set(issuedCert);
    }

    return { attempt: evaluatedAttempt, certificate: issuedCert };
  }

  static async getAttempt(attemptId: string, userId: string): Promise<AssessmentAttempt> {
    const doc = await db.collection('assessmentAttempts').doc(attemptId).get();
    if (!doc.exists) {
      throw new NotFoundError('AssessmentAttempt', attemptId);
    }
    const attempt = doc.data() as AssessmentAttempt;
    if (attempt.userId !== userId) {
      throw new Error('Unauthorized');
    }
    return attempt;
  }
}
