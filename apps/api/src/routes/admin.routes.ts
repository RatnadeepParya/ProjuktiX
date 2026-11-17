import { Router, Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import {
  bulkImportRequestSchema,
  createHandsOnExerciseSchema,
  createLessonSchema,
  createMCQQuestionSchema,
  createTechnologySchema,
} from '@projuktix/validation';
import { z } from 'zod';

export const adminRouter = Router();

// Strictly guard all admin endpoints by RBAC
adminRouter.use(
  requireAuth,
  requireRole(['super_admin', 'platform_admin', 'content_admin', 'content_reviewer', 'auditor'])
);

adminRouter.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await AdminService.getDashboardMetrics();
    res.status(200).json({ success: true, data: metrics, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

adminRouter.post(
  '/technologies',
  requireRole(['super_admin', 'platform_admin', 'content_admin']),
  validateBody(createTechnologySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tech = await AdminService.createTechnology(req.user!, req.body);
      res.status(201).json({ success: true, data: tech, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }
);

adminRouter.post(
  '/lessons',
  requireRole(['super_admin', 'platform_admin', 'content_admin']),
  validateBody(createLessonSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lesson = await AdminService.createLesson(req.user!, req.body);
      res.status(201).json({ success: true, data: lesson, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }
);

adminRouter.post(
  '/status',
  requireRole(['super_admin', 'platform_admin', 'content_admin', 'content_reviewer']),
  validateBody(
    z.object({
      resourceType: z.enum(['technologies', 'lessons', 'mcqQuestions', 'handsOnExercises']),
      resourceId: z.string().min(1),
      status: z.enum(['draft', 'in_review', 'approved', 'published', 'archived']),
    })
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await AdminService.updateContentStatus(
        req.user!,
        req.body.resourceType,
        req.body.resourceId,
        req.body.status
      );
      res.status(200).json({
        success: true,
        message: `Content status updated to ${req.body.status}`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
);

adminRouter.post(
  '/mcqs',
  requireRole(['super_admin', 'platform_admin', 'content_admin']),
  validateBody(createMCQQuestionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const question = await AdminService.createMCQ(req.user!, req.body);
      res.status(201).json({
        success: true,
        data: question,
        message: 'MCQ created. Protected answer key saved to separate collection.',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
);

adminRouter.post(
  '/exercises',
  requireRole(['super_admin', 'platform_admin', 'content_admin']),
  validateBody(createHandsOnExerciseSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exercise = await AdminService.createExercise(req.user!, req.body);
      res.status(201).json({ success: true, data: exercise, timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }
);

adminRouter.post(
  '/import',
  requireRole(['super_admin', 'platform_admin', 'content_admin']),
  validateBody(bulkImportRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { technologyId, resourceType, items } = req.body;
      const job = await AdminService.processBulkImport(req.user!, technologyId, resourceType, items);
      res.status(200).json({
        success: true,
        data: job,
        message: `Bulk import completed. Processed ${job.totalRecords} records (${job.successfulRecords} success, ${job.failedRecords} rejected).`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
);
