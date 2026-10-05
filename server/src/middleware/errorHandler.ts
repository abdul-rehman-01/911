import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.ts';
import { config } from '../config/env.ts';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = Number(err.statusCode || err.status) || 500;
  const message =
    statusCode >= 500 && !config.isDevelopment
      ? 'An unexpected internal telemetry system error occurred.'
      : err.message || 'An unexpected internal telemetry system error occurred.';

  const code =
    err.code ||
    (statusCode === 400
      ? 'BAD_REQUEST'
      : statusCode === 401
      ? 'UNAUTHORIZED'
      : statusCode === 403
      ? 'FORBIDDEN'
      : statusCode === 404
      ? 'NOT_FOUND'
      : statusCode === 409
      ? 'CONFLICT'
      : statusCode === 422
      ? 'UNPROCESSABLE_ENTITY'
      : 'INTERNAL_SERVER_ERROR');

  if (config.isDevelopment) {
    console.error('[API Error]', err.message || err);
  }

  // Never expose stack traces or environment secrets
  const safeDetails =
    err.details && typeof err.details !== 'string'
      ? err.details
      : undefined;

  return sendError({
    res,
    statusCode,
    code,
    message,
    details: safeDetails,
  });
}
