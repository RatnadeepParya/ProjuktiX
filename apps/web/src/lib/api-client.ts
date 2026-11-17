import {
  AdminDashboardMetrics,
  ApiResponse,
  AssessmentAttempt,
  AssessmentSet,
  Certificate,
  Chapter,
  Course,
  Domain,
  HandsOnExercise,
  ImportJob,
  Lesson,
  LessonWithContent,
  MCQQuestion,
  PaginatedResponse,
  PublicAppConfig,
  Technology,
  TechnologyRoadmapStage,
  UserBookmark,
  UserLearningProgress,
  UserNote,
  UserProfile,
} from '@projuktix/types';

function resolveApiBaseUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.hostname?.includes('projuktix-web.onrender.com')) {
    return 'https://projuktix-api.onrender.com/api/v1';
  }
  return '/api/v1';
}

class ApiClient {
  private baseUrl = resolveApiBaseUrl();
  private authToken: string | null = null;

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.error?.message || `API request failed with status ${response.status}`;
      throw new Error(message);
    }

    const json = (await response.json()) as ApiResponse<T>;
    return json.data;
  }

  // Config
  async getConfig(): Promise<PublicAppConfig> {
    return this.request<PublicAppConfig>('/config');
  }

  // Auth
  async syncAuth(): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/sync', { method: 'POST' });
  }

  async getMe(): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/me');
  }

  // Domains
  async getDomains(): Promise<Domain[]> {
    return this.request<Domain[]>('/domains');
  }

  async getDomain(slug: string): Promise<Domain> {
    return this.request<Domain>(`/domains/${slug}`);
  }

  // Technologies
  async getTechnologies(params?: {
    domain?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ technologies: Technology[]; totalCount: number }> {
    const query = new URLSearchParams();
    if (params?.domain) query.set('domain', params.domain);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));

    const res = await fetch(`${this.baseUrl}/technologies?${query.toString()}`);
    const json = (await res.json()) as PaginatedResponse<Technology>;
    return {
      technologies: json.data || [],
      totalCount: json.pagination?.totalCount || 0,
    };
  }

  async getTechnology(slugOrId: string): Promise<Technology> {
    return this.request<Technology>(`/technologies/${slugOrId}`);
  }

  async getRoadmap(technologyId: string): Promise<TechnologyRoadmapStage[]> {
    return this.request<TechnologyRoadmapStage[]>(`/technologies/${technologyId}/roadmap`);
  }

  // Documentation
  async getCourses(technologyId?: string): Promise<Course[]> {
    const query = technologyId ? `?technologyId=${encodeURIComponent(technologyId)}` : '';
    return this.request<Course[]>(`/documentation/courses${query}`);
  }

  async getChapters(courseId: string): Promise<Chapter[]> {
    return this.request<Chapter[]>(`/documentation/chapters?courseId=${courseId}`);
  }

  async getLessons(chapterId: string): Promise<Lesson[]> {
    return this.request<Lesson[]>(`/documentation/lessons?chapterId=${chapterId}`);
  }

  async getLesson(idOrSlug: string): Promise<LessonWithContent> {
    return this.request<LessonWithContent>(`/documentation/lessons/${idOrSlug}`);
  }

  async completeLesson(lessonId: string): Promise<UserLearningProgress> {
    return this.request<UserLearningProgress>(`/documentation/lessons/${lessonId}/complete`, {
      method: 'POST',
    });
  }

  // Assessments
  async getAssessments(technologyId?: string): Promise<AssessmentSet[]> {
    const query = technologyId ? `?technologyId=${encodeURIComponent(technologyId)}` : '';
    return this.request<AssessmentSet[]>(`/assessments${query}`);
  }

  async getAssessment(idOrSlug: string): Promise<AssessmentSet> {
    return this.request<AssessmentSet>(`/assessments/${idOrSlug}`);
  }

  async startAssessment(
    assessmentId: string
  ): Promise<{ attempt: AssessmentAttempt; questions: MCQQuestion[] }> {
    return this.request<{ attempt: AssessmentAttempt; questions: MCQQuestion[] }>(
      `/assessments/${assessmentId}/start`,
      { method: 'POST' }
    );
  }

  async submitAssessment(data: {
    attemptId: string;
    responses: Record<string, string[]>;
    timeSpentSeconds: number;
  }): Promise<{ attempt: AssessmentAttempt; certificate?: Certificate }> {
    return this.request<{ attempt: AssessmentAttempt; certificate?: Certificate }>(
      '/assessments/submit',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  // Hands-on Exercises
  async getExercises(technologyId?: string): Promise<HandsOnExercise[]> {
    const query = technologyId ? `?technologyId=${encodeURIComponent(technologyId)}` : '';
    return this.request<HandsOnExercise[]>(`/exercises${query}`);
  }

  async getExercise(idOrSlug: string): Promise<HandsOnExercise> {
    return this.request<HandsOnExercise>(`/exercises/${idOrSlug}`);
  }

  async submitExercise(
    exerciseId: string,
    data: {
      submittedCode?: string;
      outputEvidence?: string;
      checkpointVerifications?: Record<string, boolean>;
    }
  ) {
    return this.request(`/exercises/${exerciseId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User Dashboard & Bookmarks
  async getUserDashboard() {
    return this.request<any>('/user/dashboard');
  }

  async addBookmark(data: {
    resourceType: UserBookmark['resourceType'];
    resourceId: string;
    technologyId: string;
    title: string;
  }): Promise<UserBookmark> {
    return this.request<UserBookmark>('/user/bookmarks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeBookmark(resourceId: string): Promise<void> {
    return this.request<void>(`/user/bookmarks/${resourceId}`, { method: 'DELETE' });
  }

  async saveNote(data: {
    lessonId: string;
    technologyId: string;
    noteText: string;
  }): Promise<UserNote> {
    return this.request<UserNote>('/user/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Certificates
  async verifyCertificate(idOrNumber: string): Promise<Certificate> {
    return this.request<Certificate>(`/certificates/verify/${idOrNumber}`);
  }

  async getMyCertificates(): Promise<Certificate[]> {
    return this.request<Certificate[]>('/certificates/my-certificates');
  }

  // Enterprise Admin
  async getAdminDashboard(): Promise<AdminDashboardMetrics> {
    return this.request<AdminDashboardMetrics>('/admin/dashboard');
  }

  async createAdminTechnology(data: any): Promise<Technology> {
    return this.request<Technology>('/admin/technologies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createAdminLesson(data: any): Promise<Lesson> {
    return this.request<Lesson>('/admin/lessons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminStatus(data: {
    resourceType: string;
    resourceId: string;
    status: string;
  }): Promise<void> {
    return this.request<void>('/admin/status', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createAdminMCQ(data: any): Promise<MCQQuestion> {
    return this.request<MCQQuestion>('/admin/mcqs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createAdminExercise(data: any): Promise<HandsOnExercise> {
    return this.request<HandsOnExercise>('/admin/exercises', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async runBulkImport(data: {
    technologyId: string;
    resourceType: 'mcq' | 'exercise';
    items: any[];
  }): Promise<ImportJob> {
    return this.request<ImportJob>('/admin/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
