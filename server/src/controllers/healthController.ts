import { Request, Response } from 'express';
import { sendSuccess } from '../utils/apiResponse.ts';
import { config } from '../config/env.ts';
import { checkDatabaseConnection } from '../db/index.ts';

export const healthController = {
  async getHealth(_req: Request, res: Response) {
    const dbStatus = await checkDatabaseConnection();

    return sendSuccess({
      res,
      data: {
        status: 'ok',
        api: 'operational',
        database: dbStatus.status, // 'connected' | 'unavailable' | 'mock_fallback'
        databaseConnected: dbStatus.connected,
        ...(dbStatus.latencyMs !== undefined ? { databaseLatencyMs: dbStatus.latencyMs } : {}),
        ...(dbStatus.error ? { databaseMessage: dbStatus.error } : {}),
        service: 'Car 911 Performance Automotive & Telemetry API',
        version: '1.0.0',
        environment: config.nodeEnv,
        uptime: process.uptime(),
        uptimeSeconds: Math.round(process.uptime() * 10) / 10,
      },
    });
  },
};
