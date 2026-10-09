import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.ts';

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Legacy XSS filter for older user agents
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy to prevent leaking telemetry URLs
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Prevent clickjacking while permitting legitimate preview embedding in AI Studio
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Control DNS prefetching
  res.setHeader('X-DNS-Prefetch-Control', 'off');

  // Prevent Internet Explorer from executing downloads in site context
  res.setHeader('X-Download-Options', 'noopen');

  // Restrict Adobe Flash and Acrobat cross-domain policy
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  // HTTP Strict Transport Security in production environments
  if (config.isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Remove Express fingerprinting
  res.removeHeader('X-Powered-By');

  next();
}
