import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config/env.ts';
import { securityHeaders } from './middleware/securityHeaders.ts';
import { requestLogger } from './middleware/requestLogger.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { notFoundHandler } from './middleware/notFoundHandler.ts';
import { generalApiLimiter } from './middleware/rateLimiter.ts';
import { healthController } from './controllers/healthController.ts';
import apiV1Router from './routes/index.ts';

export function createApp(): Express {
  const app = express();

  // Disable Express fingerprinting header
  app.disable('x-powered-by');

  // HTTP Security Headers
  app.use(securityHeaders);

  // Hardened Environment-Aware CORS
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);

        // Check against environment-configured allowlist
        const isAllowed = config.corsOrigins.some((allowed) => {
          if (allowed === origin) return true;
          // In development, allow localhost and loopback on any port
          if (!config.isProduction && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
            return true;
          }
          return false;
        });

        if (isAllowed) {
          return callback(null, true);
        }

        if (config.isProduction) {
          return callback(new Error(`CORS error: Origin '${origin}' is not authorized by telemetry policy.`));
        }

        // Permissive fallback in development for Cloud Run preview environments
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-user-id'],
      exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset', 'Retry-After'],
    })
  );

  // Request body parsing with strict size limits (1mb)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Development request logging (safe from sensitive credentials)
  if (config.isDevelopment) {
    app.use(requestLogger);
  }

  // Root health endpoint alias
  app.get('/api/health', healthController.getHealth);

  // Apply general rate limiter across API routes
  app.use('/api', generalApiLimiter);

  // Mount API v1 router
  app.use('/api/v1', apiV1Router);

  // Fallback 404 for unhandled /api/* requests
  app.use('/api/*', notFoundHandler);

  // Central error handling middleware (sanitized for production)
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
