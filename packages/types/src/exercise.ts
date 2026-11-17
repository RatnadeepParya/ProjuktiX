import { ContentLifecycleStatus, TechnologyDifficulty } from './technology.js';

export type ExerciseType =
  | 'guided_tutorial'
  | 'step_by_step'
  | 'cli'
  | 'sql_challenge'
  | 'code_challenge'
  | 'config_tuning'
  | 'architecture_design'
  | 'troubleshooting'
  | 'production_incident'
  | 'security_assessment'
  | 'migration';

export interface ExerciseStep {
  stepNumber: number;
  title: string;
  instructionsMarkdown: string;
  commands?: string[];
  codeSnippet?: string;
  configSnippet?: string;
  expectedOutput?: string;
  hint?: string;
}

export interface ExerciseCheckpoint {
  id: string;
  stepNumber: number;
  description: string;
  criteriaType: 'code_match' | 'output_validation' | 'sql_assertion' | 'manual_verification' | 'regex_pattern';
  validationRule: string;
  points: number;
}

export interface HandsOnExercise {
  id: string;
  technologyId: string;
  versionId?: string;
  topicId: string;
  title: string;
  slug: string;
  description: string;
  exerciseType: ExerciseType;
  difficulty: TechnologyDifficulty;
  estimatedMinutes: number;
  prerequisites: string[];
  learningObjectives: string[];
  toolsRequired: string[];
  steps: ExerciseStep[];
  checkpoints: ExerciseCheckpoint[];
  starterCode?: string;
  solutionMarkdown?: string;
  status: ContentLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseSubmission {
  id: string;
  exerciseId: string;
  userId: string;
  technologyId: string;
  submittedCode?: string;
  outputEvidence?: string;
  checkpointResults: Record<string, boolean>; // checkpointId -> boolean passed
  score: number; // percentage
  passed: boolean;
  feedback: string[];
  submittedAt: string;
}
