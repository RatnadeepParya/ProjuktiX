import { db } from '../config/firebase.js';
import { ExerciseSubmission, HandsOnExercise, UserLearningProgress } from '@projuktix/types';
import { NotFoundError } from '@projuktix/shared';

export class ExerciseService {
  static async listExercises(technologyId?: string): Promise<HandsOnExercise[]> {
    let query: FirebaseFirestore.Query = db.collection('handsOnExercises').where('status', '==', 'published');
    if (technologyId) {
      query = query.where('technologyId', '==', technologyId);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as HandsOnExercise);
  }

  static async getExercise(idOrSlug: string): Promise<HandsOnExercise> {
    let doc = await db.collection('handsOnExercises').doc(idOrSlug).get();
    if (!doc.exists) {
      const snap = await db.collection('handsOnExercises').where('slug', '==', idOrSlug).limit(1).get();
      if (snap.empty) {
        throw new NotFoundError('HandsOnExercise', idOrSlug);
      }
      doc = snap.docs[0]!;
    }
    return doc.data() as HandsOnExercise;
  }

  static async submitExercise(input: {
    userId: string;
    exerciseId: string;
    submittedCode?: string;
    outputEvidence?: string;
    checkpointVerifications?: Record<string, boolean>;
  }): Promise<ExerciseSubmission> {
    const { userId, exerciseId, submittedCode, outputEvidence, checkpointVerifications = {} } = input;

    const exercise = await this.getExercise(exerciseId);

    // Evaluate checkpoints
    const checkpointResults: Record<string, boolean> = {};
    const feedback: string[] = [];
    let totalPoints = 0;
    let earnedPoints = 0;

    for (const cp of exercise.checkpoints) {
      totalPoints += cp.points;
      let passed = false;

      switch (cp.criteriaType) {
        case 'regex_pattern':
        case 'code_match': {
          if (submittedCode) {
            try {
              const regex = new RegExp(cp.validationRule, 'i');
              passed = regex.test(submittedCode);
            } catch {
              passed = submittedCode.includes(cp.validationRule);
            }
          }
          break;
        }
        case 'output_validation': {
          if (outputEvidence) {
            passed = outputEvidence.toLowerCase().includes(cp.validationRule.toLowerCase());
          }
          break;
        }
        case 'manual_verification':
        case 'sql_assertion':
        default: {
          // Verify against client claimed verification or pattern
          passed = !!checkpointVerifications[cp.id];
          break;
        }
      }

      checkpointResults[cp.id] = passed;
      if (passed) {
        earnedPoints += cp.points;
      } else {
        feedback.push(`Checkpoint '${cp.description}' was not satisfied.`);
      }
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 100;
    const passed = score >= 80;

    if (passed) {
      feedback.unshift('Congratulations! All required exercise checkpoints have been successfully satisfied.');
    }

    const subRef = db.collection('exerciseSubmissions').doc();
    const submission: ExerciseSubmission = {
      id: subRef.id,
      exerciseId: exercise.id,
      userId,
      technologyId: exercise.technologyId,
      submittedCode,
      outputEvidence,
      checkpointResults,
      score,
      passed,
      feedback,
      submittedAt: new Date().toISOString(),
    };

    await subRef.set(submission);

    // Update user learning progress in Firestore
    const progressRef = db.collection('learningProgress').doc(`${userId}_${exercise.technologyId}`);
    const progressDoc = await progressRef.get();
    const now = new Date().toISOString();

    if (progressDoc.exists) {
      const current = progressDoc.data() as UserLearningProgress;
      const completedList = new Set(current.completedExerciseIds || []);
      if (passed) {
        completedList.add(exercise.id);
      }
      await progressRef.update({
        completedExerciseIds: Array.from(completedList),
        totalMinutesSpent: (current.totalMinutesSpent || 0) + (passed ? exercise.estimatedMinutes : 10),
        updatedAt: now,
      });
    }

    return submission;
  }
}
