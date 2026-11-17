import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const standardRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP. Please try again later.',
    },
    timestamp: new Date().toISOString(),
  },
});

export const strictAuthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 50, // limit login / auth token checks to 50 per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
    timestamp: new Date().toISOString(),
  },
});
