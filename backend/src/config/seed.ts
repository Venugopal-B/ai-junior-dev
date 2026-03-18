import bcrypt from 'bcryptjs';
import { pool, query } from './db';
import { logger } from '../utils/logger';

const seed = async () => {
  const hash = await bcrypt.hash('demo1234', 12);
  const userResult = await query<{ id: string }>(
    `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
    ['Alex Chen', 'demo@devassist.ai', hash]
  );
  const user = userResult.rows[0];

  const projectResult = await query<{ id: string }>(
    `INSERT INTO projects (user_id, name, description, primary_language)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [user.id, 'e-commerce-api', 'Sample REST API for demo purposes', 'TypeScript']
  );
  const project = projectResult.rows[0];

  await query(
    `INSERT INTO project_files (project_id, file_name, content, language) VALUES ($1, $2, $3, $4)`,
    [project.id, 'productController.ts', `import { Request, Response } from 'express';\n\nexport const getProducts = async (req: Request, res: Response) => {\n  const products = await db('products').select('*');\n  res.json({ success: true, data: products });\n};`, 'TypeScript']
  );

  logger.info('Seed data inserted. Demo login: demo@devassist.ai / demo1234');
  await pool.end();
};

seed().catch(err => { logger.error('Seed failed:', err); process.exit(1); });
