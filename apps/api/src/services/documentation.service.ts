import { db } from '../config/firebase.js';
import { Chapter, Course, Lesson, LessonChunk, LessonWithContent, UserLearningProgress } from '@projuktix/types';
import { NotFoundError } from '@projuktix/shared';

export class DocumentationService {
  static async listCourses(technologyId?: string): Promise<Course[]> {
    let query: FirebaseFirestore.Query = db.collection('courses').where('status', '==', 'published');
    if (technologyId) {
      query = query.where('technologyId', '==', technologyId);
    }
    const snapshot = await query.get();
    const courses = snapshot.docs.map((doc) => doc.data() as Course);
    return courses.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  static async listChapters(courseId: string): Promise<Chapter[]> {
    const snapshot = await db
      .collection('chapters')
      .where('courseId', '==', courseId)
      .where('status', '==', 'published')
      .get();

    const chapters = snapshot.docs.map((doc) => doc.data() as Chapter);
    return chapters.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  static async listLessons(chapterId: string): Promise<Lesson[]> {
    const snapshot = await db
      .collection('lessons')
      .where('chapterId', '==', chapterId)
      .where('status', '==', 'published')
      .get();

    const lessons = snapshot.docs.map((doc) => doc.data() as Lesson);
    return lessons.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  static async getLessonWithContent(lessonIdOrSlug: string): Promise<LessonWithContent> {
    let lessonDoc = await db.collection('lessons').doc(lessonIdOrSlug).get();
    if (!lessonDoc.exists) {
      const snapshot = await db.collection('lessons').where('slug', '==', lessonIdOrSlug).limit(1).get();
      if (snapshot.empty) {
        throw new NotFoundError('Lesson', lessonIdOrSlug);
      }
      lessonDoc = snapshot.docs[0]!;
    }

    const lesson = lessonDoc.data() as Lesson;

    // Fetch chunks and sort in-memory
    const chunksSnapshot = await db
      .collection('lessonChunks')
      .where('lessonId', '==', lesson.id)
      .get();

    const chunks = chunksSnapshot.docs.map((doc) => doc.data() as LessonChunk);
    chunks.sort((a, b) => (a.chunkIndex ?? 0) - (b.chunkIndex ?? 0));
    const content = chunks.map((c) => c.contentMarkdown).join('\n\n');

    return {
      ...lesson,
      content,
    };
  }

  static async completeLesson(userId: string, lessonId: string): Promise<UserLearningProgress> {
    const lesson = await this.getLessonWithContent(lessonId);
    const progressRef = db.collection('learningProgress').doc(`${userId}_${lesson.technologyId}`);
    const progressDoc = await progressRef.get();

    const todayStr = new Date().toISOString().split('T')[0]!;

    if (!progressDoc.exists) {
      const newProgress: UserLearningProgress = {
        userId,
        technologyId: lesson.technologyId,
        enrolledPaths: [],
        completedLessonIds: [lessonId],
        completedExerciseIds: [],
        passedAssessmentIds: [],
        proficiencyLevel: 5,
        totalMinutesSpent: lesson.readingTimeMinutes,
        streakDays: 1,
        lastActiveDate: todayStr,
        updatedAt: new Date().toISOString(),
      };
      await progressRef.set(newProgress);
      return newProgress;
    }

    const current = progressDoc.data() as UserLearningProgress;
    const completedSet = new Set(current.completedLessonIds || []);
    const isNewCompletion = !completedSet.has(lessonId);
    completedSet.add(lessonId);

    // Calculate streak
    let streak = current.streakDays || 1;
    if (current.lastActiveDate !== todayStr) {
      const lastDate = new Date(current.lastActiveDate);
      const today = new Date(todayStr);
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        streak += 1;
      } else if (diffDays > 1) {
        streak = 1;
      }
    }

    const updatedMinutes = (current.totalMinutesSpent || 0) + (isNewCompletion ? lesson.readingTimeMinutes : 0);
    const updatedProficiency = Math.min(100, Math.round((completedSet.size * 3) + (current.completedExerciseIds.length * 4) + (current.passedAssessmentIds.length * 5)));

    const updated: UserLearningProgress = {
      ...current,
      completedLessonIds: Array.from(completedSet),
      totalMinutesSpent: updatedMinutes,
      proficiencyLevel: updatedProficiency,
      streakDays: streak,
      lastActiveDate: todayStr,
      updatedAt: new Date().toISOString(),
    };

    await progressRef.set(updated);
    return updated;
  }
}
