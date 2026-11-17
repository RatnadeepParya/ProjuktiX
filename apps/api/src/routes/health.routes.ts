import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'ProjuktiX Universal Technology Learning Platform',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
  });
});
