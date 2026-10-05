import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pg;

declare global {
  var _car911PostgresPool: pg.Pool | undefined;
}

export interface DatabaseStatus {
  connected: boolean;
  status: 'connected' | 'unavailable' | 'mock_fallback';
  latencyMs?: number;
  error?: string;
}

/**
 * Creates or retrieves the cached PostgreSQL connection pool.
 */
export function getOrCreatePool(): pg.Pool | null {
  if (global._car911PostgresPool) {
    return global._car911PostgresPool;
  }

  const databaseUrl = process.env.DATABASE_URL;
  const sqlHost = process.env.SQL_HOST;
  const sqlDb = process.env.SQL_DB_NAME;

  // If no database parameters are provided, do not initialize a live pool
  if (!databaseUrl && !(sqlHost && sqlDb)) {
    return null;
  }

  try {
    let pool: pg.Pool;

    if (databaseUrl && databaseUrl.trim() !== '') {
      pool = new Pool({
        connectionString: databaseUrl,
        max: 10,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
      });
    } else {
      pool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER || 'postgres',
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        max: 10,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
      });
    }

    pool.on('error', (err) => {
      console.warn('[PostgreSQL Pool Warning] Unexpected idle client error:', err.message);
    });

    global._car911PostgresPool = pool;
    return pool;
  } catch (err: any) {
    console.warn('[PostgreSQL Pool Init] Failed to create connection pool:', err.message);
    return null;
  }
}

export const pool = getOrCreatePool();

/**
 * Initialized Drizzle ORM client. If pool is null, db is typed but operations gracefully fall back.
 */
export const db = pool ? drizzle(pool, { schema }) : null;

/**
 * Actively checks whether the PostgreSQL database is reachable.
 * Never throws; returns standard structured status report.
 */
export async function checkDatabaseConnection(): Promise<DatabaseStatus> {
  const activePool = getOrCreatePool();
  if (!activePool) {
    return {
      connected: false,
      status: 'mock_fallback',
      error: 'DATABASE_URL not configured. Operating in local mock fallback mode.',
    };
  }

  const start = Date.now();
  try {
    const client = await activePool.connect();
    try {
      await client.query('SELECT 1');
      const latencyMs = Date.now() - start;
      return {
        connected: true,
        status: 'connected',
        latencyMs,
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    return {
      connected: false,
      status: 'unavailable',
      latencyMs: Date.now() - start,
      error: err.message || 'Database connection probe timed out or refused',
    };
  }
}

/**
 * Closes connection pool gracefully during server shutdown.
 */
export async function closePool(): Promise<void> {
  if (global._car911PostgresPool) {
    try {
      await global._car911PostgresPool.end();
      global._car911PostgresPool = undefined;
      console.log('[PostgreSQL] Connection pool gracefully closed.');
    } catch (err: any) {
      console.warn('[PostgreSQL] Error closing pool:', err.message);
    }
  }
}

export { schema };
