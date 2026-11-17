import { z } from 'zod';
import { userRoleSchema } from './common.schema.js';

export const updateUserProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(100).optional(),
  bio: z.string().trim().max(500).optional(),
  githubUsername: z.string().trim().max(50).optional(),
  preferences: z
    .object({
      theme: z.enum(['dark', 'light', 'system']).optional(),
      emailNotifications: z.boolean().optional(),
      codeEditorTheme: z.string().optional(),
      defaultCodeFontSize: z.number().min(10).max(28).optional(),
    })
    .optional(),
});

export const updateUserRoleSchema = z.object({
  targetUserId: z.string().min(1),
  role: userRoleSchema,
  organizationId: z.string().optional(),
});
