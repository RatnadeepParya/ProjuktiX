import { z } from 'zod';
import { contentLifecycleStatusSchema, difficultySchema } from './common.schema.js';

export const contentReferenceSchema = z.object({
  title: z.string().trim().min(1),
  url: z.string().url(),
  citation: z.string().optional(),
  sourceTier: z.enum(['official', 'standard', 'academic', 'community']).default('official'),
});

export const contentDiagramSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1),
  type: z.enum(['mermaid', 'svg', 'architecture', 'flow']),
  rawDefinition: z.string().min(1),
  description: z.string().trim().min(1),
  legend: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        color: z.string().optional(),
      })
    )
    .optional(),
});

export const createCourseSchema = z.object({
  technologyId: z.string().min(1),
  versionId: z.string().optional(),
  title: z.string().trim().min(2).max(150),
  slug: z.string().trim().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(10),
  difficulty: difficultySchema,
  order: z.number().int().default(1),
  status: contentLifecycleStatusSchema.default('draft'),
});

export const createChapterSchema = z.object({
  moduleId: z.string().min(1),
  courseId: z.string().min(1),
  technologyId: z.string().min(1),
  title: z.string().trim().min(2).max(150),
  slug: z.string().trim().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(5),
  order: z.number().int().default(1),
  status: contentLifecycleStatusSchema.default('draft'),
});

export const createLessonSchema = z.object({
  chapterId: z.string().min(1),
  moduleId: z.string().min(1),
  courseId: z.string().min(1),
  technologyId: z.string().min(1),
  title: z.string().trim().min(2).max(150),
  slug: z.string().trim().min(2).regex(/^[a-z0-9-]+$/),
  summary: z.string().trim().min(10).max(500),
  difficulty: difficultySchema,
  readingTimeMinutes: z.number().int().min(1).default(10),
  order: z.number().int().default(1),
  status: contentLifecycleStatusSchema.default('draft'),
  tags: z.array(z.string()).default([]),
  contentMarkdown: z.string().min(50, 'Lesson content must be at least 50 characters of detailed material'),
  diagrams: z.array(contentDiagramSchema).default([]),
  references: z.array(contentReferenceSchema).default([]),
});

export const updateLessonSchema = createLessonSchema.partial();
