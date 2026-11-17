import { Router, Request, Response, NextFunction } from 'express';
import { TechnologyService } from '../services/technology.service.js';

export const technologyRouter = Router();

technologyRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const domainSlug = req.query.domain as string | undefined;
    const search = req.query.search as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 24;

    const { technologies, totalCount } = await TechnologyService.listTechnologies({
      domainSlug,
      search,
      page,
      pageSize,
    });

    res.status(200).json({
      success: true,
      data: technologies,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasMore: page * pageSize < totalCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

technologyRouter.get('/:slugOrId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tech = await TechnologyService.getTechnologyBySlugOrId(req.params.slugOrId as string);
    res.status(200).json({
      success: true,
      data: tech,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

technologyRouter.get('/:id/roadmap', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roadmap = await TechnologyService.getRoadmap(req.params.id as string);
    res.status(200).json({
      success: true,
      data: roadmap,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});
