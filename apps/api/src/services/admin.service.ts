import { db } from '../config/firebase.js';
import {
  AdminDashboardMetrics,
  ContentLifecycleStatus,
  HandsOnExercise,
  ImportJob,
  ImportValidationIssue,
  Lesson,
  LessonChunk,
  MCQAnswerKey,
  MCQQuestion,
  Technology,
  UserProfile,
} from '@projuktix/types';
import {
  bulkImportExerciseItemSchema,
  bulkImportMCQItemSchema,
  createHandsOnExerciseSchema,
  createLessonSchema,
  createMCQQuestionSchema,
  createTechnologySchema,
} from '@projuktix/validation';
import { detectDuplicate, generateSearchTokens, NotFoundError, slugify } from '@projuktix/shared';
import { AuditService } from './audit.service.js';
import { z } from 'zod';

export class AdminService {
  static async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
    const [
      usersSnap,
      techSnap,
      lessonsSnap,
      mcqSnap,
      exercisesSnap,
      attemptsSnap,
      certsSnap,
      pathsSnap,
      coursesSnap,
    ] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('technologies').get(),
      db.collection('lessons').where('status', '==', 'published').count().get(),
      db.collection('mcqQuestions').where('status', '==', 'published').count().get(),
      db.collection('handsOnExercises').where('status', '==', 'published').count().get(),
      db.collection('assessmentAttempts').count().get(),
      db.collection('certificates').count().get(),
      db.collection('learningPaths').count().get(),
      db.collection('courses').count().get(),
    ]);

    const technologies = techSnap.docs.map((d) => d.data() as Technology);

    const technologyCoverage = technologies.map((t) => ({
      technologyId: t.id,
      technologyName: t.name,
      domainName: t.domainSlug,
      publishedMcqs: t.stats?.publishedMcqs || 0,
      publishedExercises: t.stats?.publishedExercises || 0,
      publishedLessons: t.stats?.publishedLessons || 0,
      isTargetMet:
        (t.stats?.publishedMcqs || 0) >= (t.stats?.targetMcqCount || 1001) &&
        (t.stats?.publishedExercises || 0) >= (t.stats?.targetExerciseCount || 1001),
    }));

    return {
      totalUsers: usersSnap.data().count,
      activeLearners: usersSnap.data().count,
      totalTechnologies: technologies.length,
      totalLearningPaths: pathsSnap.data().count,
      totalCourses: coursesSnap.data().count,
      publishedLessons: lessonsSnap.data().count,
      publishedMcqs: mcqSnap.data().count,
      publishedExercises: exercisesSnap.data().count,
      totalAttempts: attemptsSnap.data().count,
      totalCertificatesIssued: certsSnap.data().count,
      technologyCoverage,
    };
  }

  static async createTechnology(
    actor: UserProfile,
    data: z.infer<typeof createTechnologySchema>
  ): Promise<Technology> {
    const techRef = db.collection('technologies').doc();
    const searchTokens = generateSearchTokens(data.name, data.slug, data.domainSlug, ...data.tags);

    const technology: Technology = {
      id: techRef.id,
      ...data,
      searchTokens,
      stats: {
        publishedLessons: 0,
        publishedMcqs: 0,
        publishedExercises: 0,
        totalLearners: 0,
        targetMcqCount: 1001,
        targetExerciseCount: 1001,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await techRef.set(technology);
    await AuditService.log(actor, 'technology:create', 'technologies', techRef.id, { after: technology as unknown as Record<string, unknown> });
    return technology;
  }

  static async createLesson(actor: UserProfile, data: z.infer<typeof createLessonSchema>): Promise<Lesson> {
    const lessonRef = db.collection('lessons').doc();
    const { contentMarkdown, ...lessonFields } = data;

    const lesson: Lesson = {
      id: lessonRef.id,
      ...lessonFields,
      chunkCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const chunkRef = db.collection('lessonChunks').doc();
    const chunk: LessonChunk = {
      id: chunkRef.id,
      lessonId: lesson.id,
      chunkIndex: 0,
      contentMarkdown,
      hasCode: contentMarkdown.includes('```'),
      hasMermaid: contentMarkdown.includes('```mermaid'),
    };

    const batch = db.batch();
    batch.set(lessonRef, lesson);
    batch.set(chunkRef, chunk);
    await batch.commit();

    await AuditService.log(actor, 'lesson:create', 'lessons', lessonRef.id, { after: lesson as unknown as Record<string, unknown> });
    return lesson;
  }

  static async updateContentStatus(
    actor: UserProfile,
    resourceType: 'technologies' | 'lessons' | 'mcqQuestions' | 'handsOnExercises',
    resourceId: string,
    newStatus: ContentLifecycleStatus
  ): Promise<void> {
    const docRef = db.collection(resourceType).doc(resourceId);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundError(resourceType, resourceId);
    }

    const before = doc.data();
    await docRef.update({
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    await AuditService.log(actor, `${resourceType}:status_change`, resourceType, resourceId, {
      before: { status: before?.status },
      after: { status: newStatus },
    });
  }

  static async createMCQ(actor: UserProfile, data: z.infer<typeof createMCQQuestionSchema>): Promise<MCQQuestion> {
    const qRef = db.collection('mcqQuestions').doc();
    const keyRef = db.collection('mcqAnswerKeys').doc(qRef.id);

    const { answerKey, ...questionFields } = data;

    const question: MCQQuestion = {
      id: qRef.id,
      ...questionFields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const keyRecord: MCQAnswerKey = {
      questionId: qRef.id,
      ...answerKey,
    };

    const batch = db.batch();
    batch.set(qRef, question);
    batch.set(keyRef, keyRecord);
    await batch.commit();

    // Increment technology mcq count if published
    if (question.status === 'published') {
      const techRef = db.collection('technologies').doc(question.technologyId);
      const techDoc = await techRef.get();
      if (techDoc.exists) {
        const stats = techDoc.data()?.stats || {};
        await techRef.update({
          'stats.publishedMcqs': (stats.publishedMcqs || 0) + 1,
        });
      }
    }

    await AuditService.log(actor, 'mcq:create', 'mcqQuestions', qRef.id);
    return question;
  }

  static async createExercise(
    actor: UserProfile,
    data: z.infer<typeof createHandsOnExerciseSchema>
  ): Promise<HandsOnExercise> {
    const exRef = db.collection('handsOnExercises').doc();
    const exercise: HandsOnExercise = {
      id: exRef.id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await exRef.set(exercise);

    if (exercise.status === 'published') {
      const techRef = db.collection('technologies').doc(exercise.technologyId);
      const techDoc = await techRef.get();
      if (techDoc.exists) {
        const stats = techDoc.data()?.stats || {};
        await techRef.update({
          'stats.publishedExercises': (stats.publishedExercises || 0) + 1,
        });
      }
    }

    await AuditService.log(actor, 'exercise:create', 'handsOnExercises', exRef.id);
    return exercise;
  }

  /**
   * Bulk Import Engine with Schema Validation & Duplicate Detection
   */
  static async processBulkImport(
    actor: UserProfile,
    technologyId: string,
    resourceType: 'mcq' | 'exercise',
    items: unknown[]
  ): Promise<ImportJob> {
    const techDoc = await db.collection('technologies').doc(technologyId).get();
    if (!techDoc.exists) {
      throw new NotFoundError('Technology', technologyId);
    }

    const issues: ImportValidationIssue[] = [];
    let successCount = 0;
    let failCount = 0;

    const jobRef = db.collection('importJobs').doc();
    const job: ImportJob = {
      id: jobRef.id,
      resourceType,
      technologyId,
      submittedBy: actor.uid,
      status: 'processing',
      totalRecords: items.length,
      successfulRecords: 0,
      failedRecords: 0,
      issues: [],
      createdAt: new Date().toISOString(),
    };
    await jobRef.set(job);

    if (resourceType === 'mcq') {
      // Fetch existing questions for duplicate comparison
      const existingSnap = await db
        .collection('mcqQuestions')
        .where('technologyId', '==', technologyId)
        .select('promptMarkdown')
        .get();

      const existingTexts = existingSnap.docs.map((d) => ({
        id: d.id,
        text: (d.data().promptMarkdown as string) || '',
      }));

      const batch = db.batch();
      let batchCount = 0;

      for (let i = 0; i < items.length; i++) {
        const rowNum = i + 1;
        const parseResult = bulkImportMCQItemSchema.safeParse(items[i]);

        if (!parseResult.success) {
          failCount++;
          for (const err of parseResult.error.errors) {
            issues.push({
              row: rowNum,
              field: err.path.join('.'),
              message: err.message,
              severity: 'error',
            });
          }
          continue;
        }

        const data = parseResult.data;

        // Duplicate detection
        const dupCheck = detectDuplicate(data.promptMarkdown, existingTexts);
        if (dupCheck.isDuplicate) {
          failCount++;
          issues.push({
            row: rowNum,
            message: `Duplicate question detected! Matches existing question ID '${dupCheck.matchedId}' with ${(dupCheck.similarityScore * 100).toFixed(1)}% similarity.`,
            severity: 'error',
          });
          continue;
        }

        const qRef = db.collection('mcqQuestions').doc();
        const keyRef = db.collection('mcqAnswerKeys').doc(qRef.id);

        const newQuestion: MCQQuestion = {
          id: qRef.id,
          technologyId,
          versionId: undefined,
          courseId: undefined,
          topicId: data.topicId,
          subtopicId: data.subtopicId,
          questionType: data.questionType,
          promptMarkdown: data.promptMarkdown,
          codeSnippet: data.codeSnippet,
          options: data.options,
          difficulty: data.difficulty,
          tags: data.tags,
          estimatedSeconds: data.estimatedSeconds,
          status: data.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const newKey: MCQAnswerKey = {
          questionId: qRef.id,
          correctOptionIds: data.correctOptionIds,
          explanation: data.explanation,
          optionExplanations: data.optionExplanations,
          references: data.references,
        };

        batch.set(qRef, newQuestion);
        batch.set(keyRef, newKey);
        existingTexts.push({ id: qRef.id, text: data.promptMarkdown });
        batchCount++;
        successCount++;

        // Commit in chunks of 200 operations
        if (batchCount >= 200) {
          await batch.commit();
          batchCount = 0;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

      // Update tech stats
      if (successCount > 0) {
        const stats = techDoc.data()?.stats || {};
        await db
          .collection('technologies')
          .doc(technologyId)
          .update({
            'stats.publishedMcqs': (stats.publishedMcqs || 0) + successCount,
          });
      }
    } else if (resourceType === 'exercise') {
      const existingSnap = await db
        .collection('handsOnExercises')
        .where('technologyId', '==', technologyId)
        .select('title')
        .get();

      const existingTexts = existingSnap.docs.map((d) => ({
        id: d.id,
        text: (d.data().title as string) || '',
      }));

      const batch = db.batch();
      let batchCount = 0;

      for (let i = 0; i < items.length; i++) {
        const rowNum = i + 1;
        const parseResult = bulkImportExerciseItemSchema.safeParse(items[i]);

        if (!parseResult.success) {
          failCount++;
          for (const err of parseResult.error.errors) {
            issues.push({
              row: rowNum,
              field: err.path.join('.'),
              message: err.message,
              severity: 'error',
            });
          }
          continue;
        }

        const data = parseResult.data;
        const dupCheck = detectDuplicate(data.title, existingTexts);
        if (dupCheck.isDuplicate) {
          failCount++;
          issues.push({
            row: rowNum,
            message: `Duplicate exercise detected! Matches existing exercise '${dupCheck.matchedId}' with ${(dupCheck.similarityScore * 100).toFixed(1)}% similarity.`,
            severity: 'error',
          });
          continue;
        }

        const exRef = db.collection('handsOnExercises').doc();
        const newExercise: HandsOnExercise = {
          id: exRef.id,
          technologyId,
          versionId: undefined,
          topicId: data.topicId,
          title: data.title,
          slug: slugify(data.slug || data.title),
          description: data.description,
          exerciseType: data.exerciseType,
          difficulty: data.difficulty,
          estimatedMinutes: data.estimatedMinutes,
          prerequisites: data.prerequisites,
          learningObjectives: data.learningObjectives,
          toolsRequired: data.toolsRequired,
          steps: data.steps,
          checkpoints: data.checkpoints,
          starterCode: data.starterCode,
          solutionMarkdown: data.solutionMarkdown,
          status: data.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        batch.set(exRef, newExercise);
        existingTexts.push({ id: exRef.id, text: data.title });
        batchCount++;
        successCount++;

        if (batchCount >= 200) {
          await batch.commit();
          batchCount = 0;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

      if (successCount > 0) {
        const stats = techDoc.data()?.stats || {};
        await db
          .collection('technologies')
          .doc(technologyId)
          .update({
            'stats.publishedExercises': (stats.publishedExercises || 0) + successCount,
          });
      }
    }

    const finalStatus = failCount === 0 ? 'completed' : successCount > 0 ? 'partially_completed' : 'failed';
    const completedJob: ImportJob = {
      ...job,
      status: finalStatus,
      successfulRecords: successCount,
      failedRecords: failCount,
      issues,
      completedAt: new Date().toISOString(),
    };

    await jobRef.set(completedJob);
    await AuditService.log(actor, 'import:complete', 'importJobs', jobRef.id, {
      after: { successCount, failCount, resourceType, technologyId },
    });

    return completedJob;
  }
}
