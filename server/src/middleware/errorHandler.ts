import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.ts';
import { config } from '../config/env.ts';

const SENSITIVE_PATTERNS = [
  /postgres:\/\//i,
  /password/i,
  /secret/i,
  /token/i,
  /select\s+.+\s+from/i,
  /insert\s+into/i,
  /update\s+.+\s+set/i,
  /delete\s+from/i,
  /gemini/i,
];

function sanitizeMessage(msg: string, isProduction: boolean, statusCode: number): string {
  if (statusCode >= 500 && isProduction) {
    return 'An unexpected internal telemetry system error occurred.';
  }

  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(msg)) {
      return 'The telemetry subsystem encountered an error processing your request.';
    }
  }

  return msg || 'An unexpected telemetry error occurred.';
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = Number(err.statusCode || err.status) || 500;
  const rawMessage = typeof err.message === 'string' ? err.message : '';
  const message = sanitizeMessage(rawMessage, config.isProduction, statusCode);

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
      : statusCode === 429
      ? 'RATE_LIMIT_EXCEEDED'
      : 'INTERNAL_SERVER_ERROR');

  if (config.isDevelopment) {
    console.error('[API Error]', rawMessage || err);
  }

  // Never expose stack traces or raw SQL details to clients
  const safeDetails =
    err.details && typeof err.details !== 'string' && !Array.isArray(err.details)
      ? undefined
      : Array.isArray(err.details)
      ? err.details.filter((d: any) => typeof d === 'string' || (d && typeof d === 'object' && d.field))
      : undefined;

  return sendError({
    res,
    statusCode,
    code,
    message,
    details: safeDetails,
  });
}
