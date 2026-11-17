export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
    nextCursor?: string;
  };
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface PublicAppConfig {
  firebase: {
    projectId: string;
    authDomain: string;
    apiKey: string;
    appId: string;
    messagingSenderId?: string;
  };
  apiBaseUrl: string;
  appOrigin: string;
  features: {
    assessments: boolean;
    handsOnLabs: boolean;
    certifications: boolean;
    mockExams: boolean;
    adminPortal: boolean;
  };
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  activeLearners: number;
  totalTechnologies: number;
  totalLearningPaths: number;
  totalCourses: number;
  publishedLessons: number;
  publishedMcqs: number;
  publishedExercises: number;
  totalAttempts: number;
  totalCertificatesIssued: number;
  technologyCoverage: Array<{
    technologyId: string;
    technologyName: string;
    domainName: string;
    publishedMcqs: number;
    publishedExercises: number;
    publishedLessons: number;
    isTargetMet: boolean;
  }>;
}
