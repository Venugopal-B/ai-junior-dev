import fs from 'fs';
import path from 'path';
import { pool } from './db';
import { logger } from '../utils/logger';

const migrate = async () => {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const client = await pool.connect();
  try {
    await client.query(schema);
    logger.info('Migration completed successfully');
  } finally {
    client.release();
    await pool.end();
  }
};

migrate().catch(err => { logger.error('Migration failed:', err); process.exit(1); });
