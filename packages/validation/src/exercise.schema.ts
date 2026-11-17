import { z } from 'zod';
import { contentLifecycleStatusSchema, difficultySchema } from './common.schema.js';

export const exerciseTypeSchema = z.enum([
  'guided_tutorial',
  'step_by_step',
  'cli',
  'sql_challenge',
  'code_challenge',
  'config_tuning',
  'architecture_design',
  'troubleshooting',
  'production_incident',
  'security_assessment',
  'migration',
]);

export const exerciseStepSchema = z.object({
  stepNumber: z.number().int().min(1),
  title: z.string().trim().min(2),
  instructionsMarkdown: z.string().trim().min(10),
  commands: z.array(z.string()).optional(),
  codeSnippet: z.string().optional(),
  configSnippet: z.string().optional(),
  expectedOutput: z.string().optional(),
  hint: z.string().optional(),
});

export const exerciseCheckpointSchema = z.object({
  id: z.string().min(1),
  stepNumber: z.number().int().min(1),
  description: z.string().trim().min(5),
  criteriaType: z.enum([
    'code_match',
    'output_validation',
    'sql_assertion',
    'manual_verification',
    'regex_pattern',
  ]),
  validationRule: z.string().min(1),
  points: z.number().int().min(1).default(10),
});

export const createHandsOnExerciseSchema = z.object({
  technologyId: z.string().min(1),
  versionId: z.string().optional(),
  topicId: z.string().trim().min(1),
  title: z.string().trim().min(3).max(150),
  slug: z.string().trim().min(3).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(15),
  exerciseType: exerciseTypeSchema,
  difficulty: difficultySchema,
  estimatedMinutes: z.number().int().min(5).max(480).default(30),
  prerequisites: z.array(z.string()).default([]),
  learningObjectives: z.array(z.string().min(3)).min(1, 'At least one learning objective is required'),
  toolsRequired: z.array(z.string()).default([]),
  steps: z.array(exerciseStepSchema).min(1, 'At least one step is required'),
  checkpoints: z.array(exerciseCheckpointSchema).min(1, 'At least one checkpoint is required'),
  starterCode: z.string().optional(),
  solutionMarkdown: z.string().optional(),
  status: contentLifecycleStatusSchema.default('draft'),
});

export const submitExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  submittedCode: z.string().optional(),
  outputEvidence: z.string().optional(),
  checkpointVerifications: z.record(z.boolean()).optional(), // client-claimed or verified checkpoints
});
