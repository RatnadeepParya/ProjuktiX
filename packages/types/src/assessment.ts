import { ContentLifecycleStatus, TechnologyDifficulty } from './technology.js';

export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'scenario'
  | 'sql_output'
  | 'code_output'
  | 'architecture'
  | 'troubleshooting'
  | 'ordering';

export interface MCQOption {
  id: string;
  text: string;
  codeSnippet?: string;
}

export interface MCQQuestion {
  id: string;
  technologyId: string;
  versionId?: string;
  courseId?: string;
  topicId: string;
  subtopicId?: string;
  questionType: QuestionType;
  promptMarkdown: string;
  codeSnippet?: string;
  options: MCQOption[];
  difficulty: TechnologyDifficulty;
  tags: string[];
  estimatedSeconds: number;
  status: ContentLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * STRICTLY PROTECTED: Stored in a separate Firestore collection `mcqAnswerKeys`.
 * NEVER delivered to client browsers before assessment submission and evaluation.
 */
export interface MCQAnswerKey {
  questionId: string;
  correctOptionIds: string[];
  explanation: string;
  optionExplanations?: Record<string, string>;
  references: string[];
}

export interface AssessmentSet {
  id: string;
  technologyId: string;
  title: string;
  slug: string;
  description: string;
  difficulty: TechnologyDifficulty;
  passPercentage: number;
  timeLimitMinutes: number;
  negativeMarkingRate: number; // e.g. 0.25 for 1/4th penalty, 0 for none
  totalQuestions: number;
  questionIds: string[];
  status: ContentLifecycleStatus;
  isMockExam: boolean;
  certificationTrackId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  assessmentSetId: string;
  technologyId: string;
  startedAt: string;
  submittedAt?: string;
  timeSpentSeconds: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  totalQuestions: number;
  responses: Record<string, string[]>; // questionId -> selectedOptionIds
  score?: number; // 0 to 100 percentage
  rawScore?: number;
  maxScore?: number;
  passed?: boolean;
  weakTopicIds?: string[];
  evaluatedBreakdown?: AssessmentEvaluationBreakdownItem[];
}

export interface AssessmentEvaluationBreakdownItem {
  questionId: string;
  userSelectedOptionIds: string[];
  correctOptionIds: string[];
  isCorrect: boolean;
  explanation: string;
  topicId: string;
  difficulty: TechnologyDifficulty;
}
