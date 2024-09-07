import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  public pool: Pool;
  public readonly db: NodePgDatabase<typeof schema>;

  private constructor() {
    const connectionString = process.env.PGSQL_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('PGSQL_CONNECTION_STRING env var not set');
    }

    this.pool = new Pool({
      connectionString,
    });
    this.db = drizzle(this.pool, { schema });
  }

  public static get(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async close(): Promise<void> {
    if (this.pool) await this.pool.end();
  }
}
