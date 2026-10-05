import { Response } from 'express';

export interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  data?: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiErrorOptions {
  res: Response;
  statusCode?: number;
  message: string;
  code?: string;
  details?: unknown;
}

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message = 'Bad Request', details?: unknown) {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'Authentication required', details?: unknown) {
    return new ApiError(401, 'UNAUTHORIZED', message, details);
  }

  static forbidden(message = 'Access forbidden', details?: unknown) {
    return new ApiError(403, 'FORBIDDEN', message, details);
  }

  static notFound(message = 'Resource not found', details?: unknown) {
    return new ApiError(404, 'NOT_FOUND', message, details);
  }

  static conflict(message = 'Resource conflict detected', details?: unknown) {
    return new ApiError(409, 'CONFLICT', message, details);
  }

  static unprocessable(message = 'Validation failure', details?: unknown) {
    return new ApiError(422, 'UNPROCESSABLE_ENTITY', message, details);
  }

  static internal(message = 'Internal telemetry server error', details?: unknown) {
    return new ApiError(500, 'INTERNAL_SERVER_ERROR', message, details);
  }
}

export function sendSuccess<T>({
  res,
  statusCode = 200,
  data,
  message,
  pagination,
}: ApiResponseOptions<T>) {
  return res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    ...(data !== undefined ? { data } : {}),
    ...(pagination ? { pagination } : {}),
    timestamp: new Date().toISOString(),
  });
}

export function sendError({
  res,
  statusCode = 500,
  message,
  code = 'INTERNAL_ERROR',
  details,
}: ApiErrorOptions) {
  // Defensive filter: sanitize details so internal errors never leak stack traces or secret keys
  let sanitizedDetails = details;
  if (typeof sanitizedDetails === 'string' && (sanitizedDetails.includes('at ') || sanitizedDetails.includes('Error:'))) {
    sanitizedDetails = undefined;
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(sanitizedDetails !== undefined ? { details: sanitizedDetails } : {}),
    },
    timestamp: new Date().toISOString(),
  });
}

export function sendBadRequest(res: Response, message = 'Bad request parameters', details?: unknown) {
  return sendError({ res, statusCode: 400, code: 'BAD_REQUEST', message, details });
}

export function sendUnauthorized(res: Response, message = 'Unauthorized telemetry access', details?: unknown) {
  return sendError({ res, statusCode: 401, code: 'UNAUTHORIZED', message, details });
}

export function sendForbidden(res: Response, message = 'Client privilege elevation is forbidden', details?: unknown) {
  return sendError({ res, statusCode: 403, code: 'FORBIDDEN', message, details });
}

export function sendNotFound(res: Response, message = 'Requested resource not found', details?: unknown) {
  return sendError({ res, statusCode: 404, code: 'NOT_FOUND', message, details });
}

export function sendConflict(res: Response, message = 'Resource state conflict detected', details?: unknown) {
  return sendError({ res, statusCode: 409, code: 'CONFLICT', message, details });
}

export function sendUnprocessable(res: Response, message = 'Unprocessable entity parameters', details?: unknown) {
  return sendError({ res, statusCode: 422, code: 'UNPROCESSABLE_ENTITY', message, details });
}

export function sendInternalError(res: Response, message = 'Internal telemetry processing error occurred') {
  return sendError({ res, statusCode: 500, code: 'INTERNAL_SERVER_ERROR', message });
}
