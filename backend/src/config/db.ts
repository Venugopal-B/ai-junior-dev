import { Pool, PoolClient } from 'pg';
import { env } from './env';
import { logger } from '../utils/logger';

const hasExplicitDbParts = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
].some((key) => process.env[key] !== undefined);

const poolConfig = hasExplicitDbParts
  ? {
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
    }
  : {
      connectionString: env.DATABASE_URL,
    };

export const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool error', err);
});

export async function testDbConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    logger.info('Database connection established');
  } finally {
    client.release();
  }
}

export async function connectDB(): Promise<void> {
  await testDbConnection();
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export type DbClient = PoolClient;

export const db = pool;
export const query = pool.query.bind(pool);
