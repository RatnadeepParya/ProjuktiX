import { Router, Request, Response, NextFunction } from 'express';
import { DocumentationService } from '../services/documentation.service.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const documentationRouter = Router();

documentationRouter.get('/courses', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const technologyId = req.query.technologyId as string | undefined;
    const courses = await DocumentationService.listCourses(technologyId);
    res.status(200).json({ success: true, data: courses, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

documentationRouter.get('/chapters', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = req.query.courseId as string;
    if (!courseId) {
      res.status(400).json({ success: false, error: { message: 'courseId is required' } });
      return;
    }
    const chapters = await DocumentationService.listChapters(courseId);
    res.status(200).json({ success: true, data: chapters, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

documentationRouter.get('/lessons', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chapterId = req.query.chapterId as string;
    if (!chapterId) {
      res.status(400).json({ success: false, error: { message: 'chapterId is required' } });
      return;
    }
    const lessons = await DocumentationService.listLessons(chapterId);
    res.status(200).json({ success: true, data: lessons, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

documentationRouter.get('/lessons/:idOrSlug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lesson = await DocumentationService.getLessonWithContent(req.params.idOrSlug as string);
    res.status(200).json({ success: true, data: lesson, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

documentationRouter.post('/lessons/:id/complete', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const progress = await DocumentationService.completeLesson(req.user!.uid, req.params.id as string);
    res.status(200).json({
      success: true,
      data: progress,
      message: 'Lesson marked complete and learning progress updated',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});
