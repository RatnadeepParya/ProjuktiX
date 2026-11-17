import { ContentLifecycleStatus, TechnologyDifficulty } from './technology.js';

export interface ContentReference {
  title: string;
  url: string;
  citation?: string;
  sourceTier: 'official' | 'standard' | 'academic' | 'community';
}

export interface ContentDiagram {
  id: string;
  title: string;
  type: 'mermaid' | 'svg' | 'architecture' | 'flow';
  rawDefinition: string;
  description: string;
  legend?: Array<{ key: string; label: string; color?: string }>;
}

export interface Course {
  id: string;
  technologyId: string;
  versionId?: string;
  title: string;
  slug: string;
  description: string;
  difficulty: TechnologyDifficulty;
  order: number;
  status: ContentLifecycleStatus;
  moduleCount: number;
  lessonCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  technologyId: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  status: ContentLifecycleStatus;
  chapterCount: number;
}

export interface Chapter {
  id: string;
  moduleId: string;
  courseId: string;
  technologyId: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  status: ContentLifecycleStatus;
  lessonCount: number;
}

export interface Lesson {
  id: string;
  chapterId: string;
  moduleId: string;
  courseId: string;
  technologyId: string;
  title: string;
  slug: string;
  summary: string;
  difficulty: TechnologyDifficulty;
  readingTimeMinutes: number;
  order: number;
  status: ContentLifecycleStatus;
  tags: string[];
  chunkCount: number;
  diagrams: ContentDiagram[];
  references: ContentReference[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonChunk {
  id: string;
  lessonId: string;
  chunkIndex: number;
  contentMarkdown: string;
  hasCode: boolean;
  hasMermaid: boolean;
}

export interface LessonWithContent extends Lesson {
  content: string;
}
