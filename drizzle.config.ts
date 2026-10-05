import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  (process.env.SQL_HOST && process.env.SQL_DB_NAME
    ? `postgresql://${process.env.SQL_USER || 'postgres'}:${process.env.SQL_PASSWORD || ''}@${process.env.SQL_HOST}/${process.env.SQL_DB_NAME}`
    : 'postgresql://postgres:postgres@localhost:5432/car911');

export default defineConfig({
  schema: './server/src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
  strict: true,
});
