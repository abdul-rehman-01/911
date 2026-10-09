import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.ts';

interface RateLimitRecord {
  count: number;
  resetTimeMs: number;
}

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

/**
 * Creates an in-memory sliding window rate-limiter middleware.
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = 'High frequency telemetry requests detected. Rate limit exceeded. Please retry later.',
    keyGenerator = (req: Request) => {
      // Prioritize authenticated user ID, fallback to client IP
      const authUser = (req as any).user?.id || (req as any).adminUser?.id;
      if (authUser) return `user:${authUser}`;
      const forwarded = req.headers['x-forwarded-for'];
      if (typeof forwarded === 'string') {
        return `ip:${forwarded.split(',')[0].trim()}`;
      }
      return `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
    },
  } = options;

  const hits = new Map<string, RateLimitRecord>();

  // Periodic cleanup of stale memory records every 60 seconds
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTimeMs) {
        hits.delete(key);
      }
    }
  }, 60000);

  // Unref so cleanup interval does not block process shutdown or tests
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = keyGenerator(req);
    let record = hits.get(key);

    if (!record || now > record.resetTimeMs) {
      record = {
        count: 1,
        resetTimeMs: now + windowMs,
      };
      hits.set(key, record);
    } else {
      record.count++;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetTimeMs - now) / 1000);

    // Standard rate limiting HTTP headers
    res.setHeader('RateLimit-Limit', String(maxRequests));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(resetSeconds));

    if (record.count > maxRequests) {
      res.setHeader('Retry-After', String(resetSeconds));
      return sendError({
        res,
        statusCode: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message,
        details: {
          limit: maxRequests,
          windowSeconds: Math.ceil(windowMs / 1000),
          retryAfterSeconds: resetSeconds,
        },
      });
    }

    next();
  };
}

// 1. General API rate limiter (180 reqs/min)
export const generalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 240,
  message: 'General API request rate exceeded. Please slow down requests.',
});

// 2. Auth endpoints rate limiter (15 reqs/min)
export const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 15,
  message: 'Too many authentication attempts. Security lockout active. Please retry in 60 seconds.',
});

// 3. Sensitive public forms (contact, booking creation) (25 reqs/min)
export const sensitiveActionLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 25,
  message: 'High submission frequency detected for this inquiry terminal. Please retry shortly.',
});

// 4. Admin operations limiter (100 reqs/min)
export const adminLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  message: 'Administrative endpoint rate limit reached.',
});
