import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
  HttpException,
  TokenBackendError,
  TokenError,
} from './exceptions';

interface ErrorPayload {
  message: string;
  data: unknown;
  status_code?: number;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const payload: ErrorPayload = {
      message: 'Invalid request body',
      data: err.flatten().fieldErrors,
      status_code: 400,
    };
    res.status(400).json(payload);
    return;
  }

  if (err instanceof HttpException) {
    res.status(err.statusCode).json({
      message: err.message,
      data: err.data ?? null,
      status_code: err.statusCode,
    });
    return;
  }

  if (err instanceof TokenError) {
    res.status(401).json({ message: err.message, data: null });
    return;
  }

  if (err instanceof TokenBackendError) {
    res.status(401).json({ message: err.message, data: 'ACCESS_TOKEN_EXPIRED' });
    return;
  }

  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal Server Error', data: null });
}
