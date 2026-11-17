import { z } from 'zod';
import { contentLifecycleStatusSchema, difficultySchema } from './common.schema.js';

export const questionTypeSchema = z.enum([
  'single_choice',
  'multiple_choice',
  'scenario',
  'sql_output',
  'code_output',
  'architecture',
  'troubleshooting',
  'ordering',
]);

export const mcqOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1, 'Option text cannot be empty'),
  codeSnippet: z.string().optional(),
});

export const createMCQQuestionSchema = z.object({
  technologyId: z.string().min(1),
  versionId: z.string().optional(),
  courseId: z.string().optional(),
  topicId: z.string().trim().min(1),
  subtopicId: z.string().trim().optional(),
  questionType: questionTypeSchema,
  promptMarkdown: z.string().trim().min(10, 'Prompt must be at least 10 characters'),
  codeSnippet: z.string().optional(),
  options: z.array(mcqOptionSchema).min(2, 'Must have at least 2 options').max(8),
  difficulty: difficultySchema,
  tags: z.array(z.string()).default([]),
  estimatedSeconds: z.number().int().min(10).max(600).default(60),
  status: contentLifecycleStatusSchema.default('draft'),
  // When creating a question, the author/admin provides the answer key data, which the API stores into mcqAnswerKeys
  answerKey: z.object({
    correctOptionIds: z.array(z.string().min(1)).min(1, 'At least one option must be marked correct'),
    explanation: z.string().trim().min(10, 'A detailed explanation is required for content integrity'),
    optionExplanations: z.record(z.string()).optional(),
    references: z.array(z.string()).default([]),
  }),
});

export const createAssessmentSetSchema = z.object({
  technologyId: z.string().min(1),
  title: z.string().trim().min(3).max(150),
  slug: z.string().trim().min(3).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(10),
  difficulty: difficultySchema,
  passPercentage: z.number().min(1).max(100).default(70),
  timeLimitMinutes: z.number().int().min(5).max(300).default(45),
  negativeMarkingRate: z.number().min(0).max(1).default(0),
  totalQuestions: z.number().int().min(1).default(20),
  questionIds: z.array(z.string().min(1)).min(1),
  status: contentLifecycleStatusSchema.default('draft'),
  isMockExam: z.boolean().default(false),
  certificationTrackId: z.string().optional(),
});

export const submitAssessmentAttemptSchema = z.object({
  attemptId: z.string().min(1),
  responses: z.record(z.array(z.string())), // questionId -> selectedOptionIds
  timeSpentSeconds: z.number().int().nonnegative(),
});
