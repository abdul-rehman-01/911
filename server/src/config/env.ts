import dotenv from 'dotenv';

dotenv.config();

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  isProduction: boolean;
  isDevelopment: boolean;
  clientUrl: string;
  corsOrigins: string[];
  databaseUrl?: string;
  apiVersion: string;
  authSecret: string;
  allowDevHeaderAuth: boolean;
}

const rawCors = process.env.CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:3000';
const parsedCorsOrigins = rawCors
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultProdCors = 'https://911-wheat.vercel.app';
if (!parsedCorsOrigins.includes(defaultProdCors)) {
  parsedCorsOrigins.push(defaultProdCors);
}

// Ensure development origins are available when running locally
if (process.env.NODE_ENV !== 'production') {
  ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'].forEach((devOrigin) => {
    if (!parsedCorsOrigins.includes(devOrigin)) {
      parsedCorsOrigins.push(devOrigin);
    }
  });
}

const fallbackSecret = 'car911_vault_sec_key_phase9_development_2026';
if (process.env.NODE_ENV === 'production' && !process.env.AUTH_SECRET && !process.env.SESSION_SECRET) {
  console.warn('[SECURITY WARNING] Running in production without explicitly set AUTH_SECRET or SESSION_SECRET.');
}
const authSecret = process.env.AUTH_SECRET || process.env.SESSION_SECRET || fallbackSecret;

export const config: ServerConfig = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  corsOrigins: parsedCorsOrigins,
  databaseUrl: process.env.DATABASE_URL || undefined,
  apiVersion: 'v1',
  authSecret,
  allowDevHeaderAuth: process.env.NODE_ENV !== 'production',
};
