import { db } from '../config/firebase.js';
import { Domain, Technology, TechnologyRoadmapStage } from '@projuktix/types';
import { NotFoundError } from '@projuktix/shared';

export class TechnologyService {
  static async listDomains(): Promise<Domain[]> {
    const snapshot = await db.collection('domains').orderBy('displayOrder', 'asc').get();
    return snapshot.docs.map((doc) => doc.data() as Domain);
  }

  static async getDomainBySlug(slug: string): Promise<Domain> {
    const snapshot = await db.collection('domains').where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) {
      throw new NotFoundError('Domain', slug);
    }
    return snapshot.docs[0]!.data() as Domain;
  }

  static async listTechnologies(options: {
    domainSlug?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<{ technologies: Technology[]; totalCount: number }> {
    const { domainSlug, search, page = 1, pageSize = 20, status = 'published' } = options;

    let query: FirebaseFirestore.Query = db.collection('technologies');

    if (status !== 'all') {
      query = query.where('status', '==', status);
    }

    if (domainSlug) {
      query = query.where('domainSlug', '==', domainSlug);
    }

    if (search && search.trim().length >= 2) {
      const token = search.trim().toLowerCase();
      query = query.where('searchTokens', 'array-contains', token);
    }

    const snapshot = await query.get();
    const all = snapshot.docs.map((doc) => doc.data() as Technology);

    // Apply pagination
    const totalCount = all.length;
    const startIndex = (page - 1) * pageSize;
    const paginated = all.slice(startIndex, startIndex + pageSize);

    return { technologies: paginated, totalCount };
  }

  static async getTechnologyBySlugOrId(slugOrId: string): Promise<Technology> {
    let tech: Technology;
    const doc = await db.collection('technologies').doc(slugOrId).get();
    if (doc.exists) {
      tech = doc.data() as Technology;
    } else {
      const snapshot = await db.collection('technologies').where('slug', '==', slugOrId).limit(1).get();
      if (snapshot.empty) {
        throw new NotFoundError('Technology', slugOrId);
      }
      tech = snapshot.docs[0]!.data() as Technology;
    }

    try {
      const [lessonsCount, mcqsCount, exercisesCount] = await Promise.all([
        db.collection('lessons').where('technologyId', '==', tech.id).where('status', '==', 'published').count().get(),
        db.collection('mcqQuestions').where('technologyId', '==', tech.id).where('status', '==', 'published').count().get(),
        db.collection('handsOnExercises').where('technologyId', '==', tech.id).where('status', '==', 'published').count().get(),
      ]);

      tech.stats = {
        publishedLessons: lessonsCount.data().count,
        publishedMcqs: mcqsCount.data().count,
        publishedExercises: exercisesCount.data().count,
        totalLearners: tech.stats?.totalLearners || 0,
        targetMcqCount: 1001,
        targetExerciseCount: 1001,
      };
    } catch {
      // Maintain base stats if aggregation count is unavailable
    }

    return tech;
  }

  static async getRoadmap(technologyId: string): Promise<TechnologyRoadmapStage[]> {
    const snapshot = await db
      .collection('technologies')
      .doc(technologyId)
      .collection('roadmap')
      .orderBy('order', 'asc')
      .get();

    if (snapshot.empty) {
      // Return default 4-stage roadmap skeleton
      return [
        {
          stage: 'beginner',
          title: 'Foundations & Architecture',
          description: 'Core concepts, terminologies, architecture, and installation setup.',
          order: 1,
          nodes: [],
        },
        {
          stage: 'intermediate',
          title: 'Implementation & Configuration',
          description: 'Hands-on configuration, core administration, and standard development workflows.',
          order: 2,
          nodes: [],
        },
        {
          stage: 'advanced',
          title: 'Performance, Internals & Security',
          description: 'Internal engine mechanisms, performance optimization, and security architecture.',
          order: 3,
          nodes: [],
        },
        {
          stage: 'expert',
          title: 'Enterprise Architecture & Disaster Recovery',
          description: 'High availability, migration, multi-cloud topologies, and production resilience.',
          order: 4,
          nodes: [],
        },
      ];
    }

    return snapshot.docs.map((doc) => doc.data() as TechnologyRoadmapStage);
  }
}
