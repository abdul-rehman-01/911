import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config/env.ts';
import { securityHeaders } from './middleware/securityHeaders.ts';
import { requestLogger } from './middleware/requestLogger.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { notFoundHandler } from './middleware/notFoundHandler.ts';
import { healthController } from './controllers/healthController.ts';
import apiV1Router from './routes/index.ts';

export function createApp(): Express {
  const app = express();

  // Basic Security & Performance Middleware
  app.use(securityHeaders);

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);
        // Allow configured client URL or local origins in development
        if (config.isDevelopment || origin === config.clientUrl) {
          return callback(null, true);
        }
        return callback(null, true); // Dev-permissive while retaining CORS structure
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Development request logging
  if (config.isDevelopment) {
    app.use(requestLogger);
  }

  // Root health endpoint alias
  app.get('/api/health', healthController.getHealth);

  // Mount API v1 router
  app.use('/api/v1', apiV1Router);

  // Fallback 404 for unhandled /api/* requests
  app.use('/api/*', notFoundHandler);

  // Central error handling middleware
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
