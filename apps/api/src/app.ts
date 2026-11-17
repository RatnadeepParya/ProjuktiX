import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { standardRateLimiter } from './middlewares/rate-limit.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

import { healthRouter } from './routes/health.routes.js';
import { configRouter } from './routes/config.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { domainRouter } from './routes/domain.routes.js';
import { technologyRouter } from './routes/technology.routes.js';
import { documentationRouter } from './routes/documentation.routes.js';
import { assessmentRouter } from './routes/assessment.routes.js';
import { exerciseRouter } from './routes/exercise.routes.js';
import { userRouter } from './routes/user.routes.js';
import { certificateRouter } from './routes/certificate.routes.js';
import { adminRouter } from './routes/admin.routes.js';

export function createApp(): Express {
  const app = express();

  // Security headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Managed per frontend requirements
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (env.corsAllowedOrigins.includes(origin) || env.nodeEnv !== 'production') {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body parser with 10mb limit for content & bulk imports
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global rate limiter
  app.use(standardRateLimiter);

  // Routes
  app.use('/', healthRouter);
  app.use('/api/v1', configRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/domains', domainRouter);
  app.use('/api/v1/technologies', technologyRouter);
  app.use('/api/v1/documentation', documentationRouter);
  app.use('/api/v1/assessments', assessmentRouter);
  app.use('/api/v1/exercises', exerciseRouter);
  app.use('/api/v1/user', userRouter);
  app.use('/api/v1/certificates', certificateRouter);
  app.use('/api/v1/admin', adminRouter);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
