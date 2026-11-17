import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { strictAuthRateLimiter } from '../middlewares/rate-limit.middleware.js';

export const authRouter = Router();

authRouter.use(strictAuthRateLimiter);

authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: req.user,
    timestamp: new Date().toISOString(),
  });
});

authRouter.post('/sync', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
      message: 'User profile synchronized successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});
