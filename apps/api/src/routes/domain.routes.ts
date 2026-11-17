import { Router, Request, Response, NextFunction } from 'express';
import { TechnologyService } from '../services/technology.service.js';

export const domainRouter = Router();

domainRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const domains = await TechnologyService.listDomains();
    res.status(200).json({
      success: true,
      data: domains,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

domainRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const domain = await TechnologyService.getDomainBySlug(req.params.slug as string);
    res.status(200).json({
      success: true,
      data: domain,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});
