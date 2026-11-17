import { Router, Request, Response, NextFunction } from 'express';
import { AssessmentService } from '../services/assessment.service.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { submitAssessmentAttemptSchema } from '@projuktix/validation';

export const assessmentRouter = Router();

assessmentRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const technologyId = req.query.technologyId as string | undefined;
    const assessments = await AssessmentService.listAssessmentSets(technologyId);
    res.status(200).json({ success: true, data: assessments, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

assessmentRouter.get('/:idOrSlug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assessment = await AssessmentService.getAssessmentSet(req.params.idOrSlug as string);
    res.status(200).json({ success: true, data: assessment, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

assessmentRouter.post('/:id/start', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AssessmentService.startAssessment(req.user!.uid, req.params.id as string);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Assessment started. Correct answer keys are securely isolated on backend.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

assessmentRouter.post(
  '/submit',
  requireAuth,
  validateBody(submitAssessmentAttemptSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { attemptId, responses, timeSpentSeconds } = req.body;
      const result = await AssessmentService.submitAssessment({
        attemptId,
        userId: req.user!.uid,
        responses,
        timeSpentSeconds,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Assessment evaluated and scored successfully.',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
);

assessmentRouter.get('/attempts/:attemptId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attempt = await AssessmentService.getAttempt(req.params.attemptId as string, req.user!.uid);
    res.status(200).json({ success: true, data: attempt, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});
