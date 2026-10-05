import { app } from './app.ts';
import { config } from './config/env.ts';

const PORT = config.port;

export function startServer() {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Car 911] Dedicated API server running on http://0.0.0.0:${PORT}`);
    console.log(`[Car 911] API v1 base: http://0.0.0.0:${PORT}/api/v1`);
    console.log(`[Car 911] Health endpoint: http://0.0.0.0:${PORT}/api/v1/health`);
  });

  return server;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
