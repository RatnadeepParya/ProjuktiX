import { Router, Request, Response, NextFunction } from 'express';
import { ExerciseService } from '../services/exercise.service.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { submitExerciseSchema } from '@projuktix/validation';

export const exerciseRouter = Router();

exerciseRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const technologyId = req.query.technologyId as string | undefined;
    const exercises = await ExerciseService.listExercises(technologyId);
    res.status(200).json({ success: true, data: exercises, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

exerciseRouter.get('/:idOrSlug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exercise = await ExerciseService.getExercise(req.params.idOrSlug as string);
    res.status(200).json({ success: true, data: exercise, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

exerciseRouter.post(
  '/:id/submit',
  requireAuth,
  validateBody(submitExerciseSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { submittedCode, outputEvidence, checkpointVerifications } = req.body;
      const submission = await ExerciseService.submitExercise({
        userId: req.user!.uid,
        exerciseId: req.params.id as string,
        submittedCode,
        outputEvidence,
        checkpointVerifications,
      });

      res.status(200).json({
        success: true,
        data: submission,
        message: 'Hands-on exercise submitted and checkpoints evaluated.',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
);
