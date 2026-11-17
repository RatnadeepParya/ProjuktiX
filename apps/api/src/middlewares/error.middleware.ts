import { Request, Response, NextFunction } from 'express';
import { AppError } from '@projuktix/shared';
import { ApiErrorResponse } from '@projuktix/types';
import { env } from '../config/env.js';

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : 'INTERNAL_SERVER_ERROR';

  if (statusCode >= 500) {
    console.error('[ProjuktiX-API Error]:', err);
  }

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message: statusCode >= 500 && env.nodeEnv === 'production' ? 'An unexpected server error occurred' : err.message,
      details: isAppError ? err.details : undefined,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
}
