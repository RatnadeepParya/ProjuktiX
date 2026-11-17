import { Router, Request, Response } from 'express';
import { env } from '../config/env.js';
import { PublicAppConfig } from '@projuktix/types';

export const configRouter = Router();

configRouter.get('/config', (_req: Request, res: Response) => {
  const publicConfig: PublicAppConfig = {
    firebase: {
      projectId: env.firebase.projectId,
      authDomain: env.firebase.authDomain,
      apiKey: env.firebase.webApiKey,
      appId: env.firebase.appId,
      messagingSenderId: env.firebase.messagingSenderId,
    },
    apiBaseUrl: env.nodeEnv === 'production' ? '/api/v1' : `http://localhost:${env.port}/api/v1`,
    appOrigin: env.appOrigin,
    features: {
      assessments: true,
      handsOnLabs: true,
      certifications: true,
      mockExams: true,
      adminPortal: true,
    },
  };

  res.status(200).json({
    success: true,
    data: publicConfig,
    timestamp: new Date().toISOString(),
  });
});
