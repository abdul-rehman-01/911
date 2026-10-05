import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, checkDatabaseConnection, closePool } from './index.ts';

export async function runMigrations() {
  console.log('--- CAR 911 POSTGRESQL MIGRATION RUNNER ---');

  if (!db) {
    console.warn('[Migrate Aborted] Database client not initialized. DATABASE_URL is not set.');
    return;
  }

  const connStatus = await checkDatabaseConnection();
  if (!connStatus.connected) {
    console.warn(`[Migrate Aborted] Database is unreachable (${connStatus.status}): ${connStatus.error}`);
    return;
  }

  console.log('[Migrate] Applying pending database migrations from ./drizzle ...');
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('[Migrate Success] All database migrations applied successfully.');
  } catch (err: any) {
    console.error('[Migrate Error] Migration failed:', err.message);
    throw err;
  }
}

if (process.argv[1]?.endsWith('migrate.ts')) {
  runMigrations()
    .then(async () => {
      await closePool();
      process.exit(0);
    })
    .catch(async () => {
      await closePool();
      process.exit(1);
    });
}
