import { z } from 'zod';
import { contentLifecycleStatusSchema } from './common.schema.js';

export const technologyVersionSchema = z.object({
  id: z.string().min(1),
  versionString: z.string().min(1),
  isLts: z.boolean().default(false),
  isDefault: z.boolean().default(false),
  releaseDate: z.string().optional(),
  endOfLifeDate: z.string().optional(),
  status: z.enum(['active', 'deprecated', 'preview']).default('active'),
});

export const createTechnologySchema = z.object({
  name: z.string().trim().min(1, 'Technology name is required').max(100),
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be URL-safe (lowercase letters, numbers, hyphens)'),
  domainId: z.string().min(1, 'Domain is required'),
  domainSlug: z.string().min(1),
  shortDescription: z.string().trim().min(10, 'Short description must be at least 10 characters').max(300),
  longDescription: z.string().trim().min(30, 'Long description must be at least 30 characters'),
  logoUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  officialDocsUrl: z.string().url().optional(),
  tags: z.array(z.string().trim()).default([]),
  versions: z.array(technologyVersionSchema).default([]),
  status: contentLifecycleStatusSchema.default('draft'),
});

export const updateTechnologySchema = createTechnologySchema.partial();
