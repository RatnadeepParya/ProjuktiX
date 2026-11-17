import { z } from 'zod';

export const difficultySchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);

export const contentLifecycleStatusSchema = z.enum([
  'draft',
  'in_review',
  'approved',
  'published',
  'archived',
]);

export const userRoleSchema = z.enum([
  'super_admin',
  'platform_admin',
  'content_admin',
  'content_reviewer',
  'instructor',
  'org_admin',
  'org_manager',
  'learner',
  'auditor',
]);

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  search: z.string().trim().optional(),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});
