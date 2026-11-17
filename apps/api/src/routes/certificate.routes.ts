import { Router, Request, Response, NextFunction } from 'express';
import { CertificateService } from '../services/certificate.service.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const certificateRouter = Router();

// Public verification route - NO authentication required
certificateRouter.get('/verify/:idOrNumber', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cert = await CertificateService.verifyCertificate(req.params.idOrNumber as string);
    res.status(200).json({
      success: true,
      data: cert,
      message: 'Certificate verified against authoritative ProjuktiX credential registry.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// User's own certificates
certificateRouter.get('/my-certificates', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const certs = await CertificateService.listUserCertificates(req.user!.uid);
    res.status(200).json({ success: true, data: certs, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});
