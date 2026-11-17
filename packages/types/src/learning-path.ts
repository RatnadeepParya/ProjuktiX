import { ContentLifecycleStatus, TechnologyDifficulty } from './technology.js';

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  domainId: string;
  domainSlug: string;
  primaryTechnologyId: string;
  targetRole: string;
  difficulty: TechnologyDifficulty;
  estimatedWeeks: number;
  prerequisites: string[];
  orderedCourseIds: string[];
  orderedExerciseIds: string[];
  assessmentIds: string[];
  skillsAcquired: string[];
  completionCriteria: string;
  status: ContentLifecycleStatus;
  enrolledCount: number;
  completionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserLearningProgress {
  userId: string;
  technologyId: string;
  enrolledPaths: string[];
  completedLessonIds: string[];
  completedExerciseIds: string[];
  passedAssessmentIds: string[];
  proficiencyLevel: number; // 0 to 100
  totalMinutesSpent: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  updatedAt: string;
}

export interface UserBookmark {
  id: string;
  userId: string;
  resourceType: 'lesson' | 'exercise' | 'assessment' | 'technology';
  resourceId: string;
  technologyId: string;
  title: string;
  createdAt: string;
}

export interface UserNote {
  id: string;
  userId: string;
  lessonId: string;
  technologyId: string;
  noteText: string;
  createdAt: string;
  updatedAt: string;
}
