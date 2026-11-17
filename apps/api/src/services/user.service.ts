import { db } from '../config/firebase.js';
import { Certificate, UserBookmark, UserLearningProgress, UserNote, UserProfile } from '@projuktix/types';
import { NotFoundError } from '@projuktix/shared';

export interface UserDashboardData {
  user: UserProfile;
  overallProgress: {
    totalMinutesSpent: number;
    completedLessonsCount: number;
    completedExercisesCount: number;
    passedAssessmentsCount: number;
    currentStreak: number;
  };
  technologiesInProgress: Array<{
    technologyId: string;
    technologyName: string;
    domainSlug: string;
    proficiencyLevel: number;
    completedLessons: number;
    completedExercises: number;
  }>;
  recentCertificates: Certificate[];
  bookmarks: UserBookmark[];
  recentNotes: UserNote[];
}

export class UserService {
  static async getDashboard(userId: string): Promise<UserDashboardData> {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new NotFoundError('User', userId);
    }
    const user = userDoc.data() as UserProfile;

    // Fetch learning progress records for user
    const progressSnapshot = await db.collection('learningProgress').where('userId', '==', userId).get();
    const progressDocs = progressSnapshot.docs.map((d) => d.data() as UserLearningProgress);

    let totalMinutes = 0;
    let totalLessons = 0;
    let totalExercises = 0;
    let totalAssessments = 0;
    let maxStreak = 0;

    const techProgressList: UserDashboardData['technologiesInProgress'] = [];

    for (const prog of progressDocs) {
      totalMinutes += prog.totalMinutesSpent || 0;
      totalLessons += prog.completedLessonIds?.length || 0;
      totalExercises += prog.completedExerciseIds?.length || 0;
      totalAssessments += prog.passedAssessmentIds?.length || 0;
      if (prog.streakDays && prog.streakDays > maxStreak) {
        maxStreak = prog.streakDays;
      }

      // Fetch tech summary
      const techDoc = await db.collection('technologies').doc(prog.technologyId).get();
      if (techDoc.exists) {
        const tData = techDoc.data()!;
        techProgressList.push({
          technologyId: prog.technologyId,
          technologyName: tData.name,
          domainSlug: tData.domainSlug,
          proficiencyLevel: prog.proficiencyLevel || 0,
          completedLessons: prog.completedLessonIds?.length || 0,
          completedExercises: prog.completedExerciseIds?.length || 0,
        });
      }
    }

    // Fetch user's certificates
    const certSnap = await db
      .collection('certificates')
      .where('userId', '==', userId)
      .orderBy('issuedAt', 'desc')
      .limit(5)
      .get();
    const recentCertificates = certSnap.docs.map((d) => d.data() as Certificate);

    // Fetch user's bookmarks
    const bmSnap = await db
      .collection('userBookmarks')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    const bookmarks = bmSnap.docs.map((d) => d.data() as UserBookmark);

    // Fetch user's notes
    const notesSnap = await db
      .collection('userNotes')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .limit(10)
      .get();
    const recentNotes = notesSnap.docs.map((d) => d.data() as UserNote);

    return {
      user,
      overallProgress: {
        totalMinutesSpent: totalMinutes,
        completedLessonsCount: totalLessons,
        completedExercisesCount: totalExercises,
        passedAssessmentsCount: totalAssessments,
        currentStreak: maxStreak,
      },
      technologiesInProgress: techProgressList,
      recentCertificates,
      bookmarks,
      recentNotes,
    };
  }

  static async addBookmark(input: {
    userId: string;
    resourceType: UserBookmark['resourceType'];
    resourceId: string;
    technologyId: string;
    title: string;
  }): Promise<UserBookmark> {
    const docRef = db.collection('userBookmarks').doc(`${input.userId}_${input.resourceId}`);
    const bookmark: UserBookmark = {
      id: docRef.id,
      ...input,
      createdAt: new Date().toISOString(),
    };
    await docRef.set(bookmark);
    return bookmark;
  }

  static async removeBookmark(userId: string, resourceId: string): Promise<void> {
    await db.collection('userBookmarks').doc(`${userId}_${resourceId}`).delete();
  }

  static async saveNote(input: {
    userId: string;
    lessonId: string;
    technologyId: string;
    noteText: string;
  }): Promise<UserNote> {
    const docRef = db.collection('userNotes').doc(`${input.userId}_${input.lessonId}`);
    const note: UserNote = {
      id: docRef.id,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await docRef.set(note);
    return note;
  }
}
