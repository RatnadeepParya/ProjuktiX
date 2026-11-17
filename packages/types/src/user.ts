export type UserRole =
  | 'super_admin'
  | 'platform_admin'
  | 'content_admin'
  | 'content_reviewer'
  | 'instructor'
  | 'org_admin'
  | 'org_manager'
  | 'learner'
  | 'auditor';

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  emailNotifications: boolean;
  codeEditorTheme: string;
  defaultCodeFontSize: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  role: UserRole;
  organizationId?: string;
  isActive: boolean;
  bio?: string;
  githubUsername?: string;
  preferences: UserPreferences;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  badgeId: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}
