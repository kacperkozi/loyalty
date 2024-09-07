import dotenv from 'dotenv-flow';
dotenv.config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from './schema';

export async function runMigration() {
  const connectionString = process.env.PGSQL_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('PGSQL_CONNECTION_STRING env var not set');
  }
  const pool = new Pool({
    connectionString,
  });
  const db = drizzle(pool, { schema });

  if (process.env.NODE_ENV !== 'test') console.log('Starting migration');
  await migrate(db, { migrationsFolder: 'drizzle' });
  if (process.env.NODE_ENV !== 'test') console.log('Migration completed');

  await pool.end();
}

if (process.env.NODE_ENV !== 'test') {
  runMigration().catch(console.error);
}
