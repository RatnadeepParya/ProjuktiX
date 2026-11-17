import { z } from 'zod';
import { difficultySchema, contentLifecycleStatusSchema } from './common.schema.js';
import { questionTypeSchema, mcqOptionSchema } from './assessment.schema.js';
import { exerciseTypeSchema, exerciseStepSchema, exerciseCheckpointSchema } from './exercise.schema.js';

export const bulkImportMCQItemSchema = z.object({
  id: z.string().optional(),
  topicId: z.string().trim().min(1, 'topicId is required'),
  subtopicId: z.string().trim().optional(),
  questionType: questionTypeSchema.default('single_choice'),
  promptMarkdown: z.string().trim().min(10, 'promptMarkdown must be at least 10 chars'),
  codeSnippet: z.string().optional(),
  options: z.array(mcqOptionSchema).min(2, 'Must provide at least 2 options'),
  correctOptionIds: z.array(z.string().min(1)).min(1, 'Must have at least one correct option'),
  difficulty: difficultySchema.default('intermediate'),
  explanation: z.string().trim().min(10, 'A detailed explanation is required'),
  optionExplanations: z.record(z.string()).optional(),
  references: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  estimatedSeconds: z.number().int().min(10).max(600).default(60),
  status: contentLifecycleStatusSchema.default('draft'),
});

export const bulkImportExerciseItemSchema = z.object({
  id: z.string().optional(),
  topicId: z.string().trim().min(1, 'topicId is required'),
  title: z.string().trim().min(3),
  slug: z.string().trim().min(3),
  description: z.string().trim().min(15),
  exerciseType: exerciseTypeSchema.default('cli'),
  difficulty: difficultySchema.default('intermediate'),
  estimatedMinutes: z.number().int().min(5).default(30),
  prerequisites: z.array(z.string()).default([]),
  learningObjectives: z.array(z.string()).min(1),
  toolsRequired: z.array(z.string()).default([]),
  steps: z.array(exerciseStepSchema).min(1),
  checkpoints: z.array(exerciseCheckpointSchema).min(1),
  starterCode: z.string().optional(),
  solutionMarkdown: z.string().optional(),
  status: contentLifecycleStatusSchema.default('draft'),
});

export const bulkImportRequestSchema = z.object({
  technologyId: z.string().min(1),
  resourceType: z.enum(['mcq', 'exercise', 'lesson']),
  items: z.array(z.record(z.unknown())).min(1, 'Must provide at least one item to import'),
});
