import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public retryAfterSeconds?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function createError(message: string, statusCode = 500, retryAfterSeconds?: number): AppError {
  return new AppError(message, statusCode, retryAfterSeconds);
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ZodError) {
    logger.warn('Validation failed', err.flatten().fieldErrors);
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: 'Validation failed',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof AppError) {
    logger.warn(err.message);
    if (err.retryAfterSeconds) {
      res.setHeader('Retry-After', String(err.retryAfterSeconds));
    }
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      message: err.message,
    });
    return;
  }

  logger.error(err.message, err.stack);

  const statusCode = 'statusCode' in err ? (err as { statusCode: number }).statusCode : 500;
  const message = env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({ success: false, error: message, message });
};

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction): void => {
  next(createError('Route not found', 404));
};

export const errorMiddleware = errorHandler;
