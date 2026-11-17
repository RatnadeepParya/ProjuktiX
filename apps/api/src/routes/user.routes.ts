import { Router, Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const userRouter = Router();

userRouter.get('/dashboard', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dashboard = await UserService.getDashboard(req.user!.uid);
    res.status(200).json({ success: true, data: dashboard, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

userRouter.post('/bookmarks', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookmark = await UserService.addBookmark({
      userId: req.user!.uid,
      resourceType: req.body.resourceType,
      resourceId: req.body.resourceId,
      technologyId: req.body.technologyId,
      title: req.body.title,
    });
    res.status(201).json({ success: true, data: bookmark, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

userRouter.delete('/bookmarks/:resourceId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await UserService.removeBookmark(req.user!.uid, req.params.resourceId as string);
    res.status(200).json({ success: true, message: 'Bookmark removed', timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

userRouter.post('/notes', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const note = await UserService.saveNote({
      userId: req.user!.uid,
      lessonId: req.body.lessonId,
      technologyId: req.body.technologyId,
      noteText: req.body.noteText,
    });
    res.status(200).json({ success: true, data: note, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});
