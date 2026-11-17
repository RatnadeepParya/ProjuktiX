export type TechnologyDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type ContentLifecycleStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';

export interface TechnologyVersion {
  id: string;
  versionString: string;
  isLts: boolean;
  isDefault: boolean;
  releaseDate?: string;
  endOfLifeDate?: string;
  status: 'active' | 'deprecated' | 'preview';
}

export interface TechnologyStats {
  publishedLessons: number;
  publishedMcqs: number;
  publishedExercises: number;
  totalLearners: number;
  targetMcqCount: number;
  targetExerciseCount: number;
}

export interface Technology {
  id: string;
  name: string;
  slug: string;
  domainId: string;
  domainSlug: string;
  shortDescription: string;
  longDescription: string;
  logoUrl?: string;
  websiteUrl?: string;
  officialDocsUrl?: string;
  tags: string[];
  versions: TechnologyVersion[];
  status: ContentLifecycleStatus;
  stats: TechnologyStats;
  searchTokens: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TechnologyRoadmapNode {
  id: string;
  title: string;
  description: string;
  order: number;
  courseId?: string;
  exerciseId?: string;
  assessmentId?: string;
  estimatedHours: number;
}

export interface TechnologyRoadmapStage {
  stage: TechnologyDifficulty;
  title: string;
  description: string;
  order: number;
  nodes: TechnologyRoadmapNode[];
}
