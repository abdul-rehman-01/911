import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { app } from './server/src/app.ts';
import { config } from './server/src/config/env.ts';
import { closePool } from './server/src/db/index.ts';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const PORT = config.port;

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Car 911] Full-Stack server active on http://0.0.0.0:${PORT}`);
    console.log(`[Car 911] REST API endpoint: http://0.0.0.0:${PORT}/api/v1`);
    console.log(`[Car 911] System Health: http://0.0.0.0:${PORT}/api/v1/health`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[Car 911] Received ${signal}. Initiating graceful shutdown...`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('[Car 911] Failed to initialize server:', err);
  process.exit(1);
});
