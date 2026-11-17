import { UserRole } from '@projuktix/types';

export type Permission =
  | 'content:read'
  | 'content:create'
  | 'content:edit'
  | 'content:review'
  | 'content:publish'
  | 'content:archive'
  | 'content:import'
  | 'assessment:take'
  | 'assessment:author'
  | 'assessment:review'
  | 'exercise:submit'
  | 'exercise:author'
  | 'exercise:review'
  | 'certificate:issue'
  | 'certificate:verify'
  | 'admin:access'
  | 'admin:users'
  | 'admin:roles'
  | 'admin:audit'
  | 'admin:settings';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'content:read',
    'content:create',
    'content:edit',
    'content:review',
    'content:publish',
    'content:archive',
    'content:import',
    'assessment:take',
    'assessment:author',
    'assessment:review',
    'exercise:submit',
    'exercise:author',
    'exercise:review',
    'certificate:issue',
    'certificate:verify',
    'admin:access',
    'admin:users',
    'admin:roles',
    'admin:audit',
    'admin:settings',
  ],
  platform_admin: [
    'content:read',
    'content:create',
    'content:edit',
    'content:review',
    'content:publish',
    'content:archive',
    'content:import',
    'assessment:take',
    'assessment:author',
    'assessment:review',
    'exercise:submit',
    'exercise:author',
    'exercise:review',
    'certificate:issue',
    'certificate:verify',
    'admin:access',
    'admin:users',
    'admin:audit',
  ],
  content_admin: [
    'content:read',
    'content:create',
    'content:edit',
    'content:review',
    'content:publish',
    'content:archive',
    'content:import',
    'assessment:take',
    'assessment:author',
    'assessment:review',
    'exercise:submit',
    'exercise:author',
    'exercise:review',
    'admin:access',
  ],
  content_reviewer: [
    'content:read',
    'content:review',
    'assessment:take',
    'assessment:review',
    'exercise:submit',
    'exercise:review',
    'admin:access',
  ],
  instructor: [
    'content:read',
    'content:create',
    'content:edit',
    'assessment:take',
    'assessment:author',
    'exercise:submit',
    'exercise:author',
  ],
  org_admin: [
    'content:read',
    'assessment:take',
    'exercise:submit',
    'certificate:verify',
    'admin:access',
  ],
  org_manager: [
    'content:read',
    'assessment:take',
    'exercise:submit',
    'certificate:verify',
  ],
  learner: [
    'content:read',
    'assessment:take',
    'exercise:submit',
    'certificate:verify',
  ],
  auditor: [
    'content:read',
    'admin:access',
    'admin:audit',
    'certificate:verify',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}
