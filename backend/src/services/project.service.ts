import { db } from '../config/db';
import { Project } from '../types';
import { createError } from '../middleware/error.middleware';

export async function getProjectsByUser(userId: string): Promise<Project[]> {
  const result = await db.query(
    `SELECT p.*, 
      (SELECT COUNT(*) FROM project_files WHERE project_id = p.id) AS file_count,
      (SELECT COUNT(*) FROM analysis_runs WHERE project_id = p.id) AS run_count
     FROM projects p WHERE p.user_id = $1 ORDER BY p.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getProjectById(projectId: string, userId: string): Promise<Project> {
  const result = await db.query(
    'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );
  if (!result.rows[0]) throw createError('Project not found', 404);
  return result.rows[0];
}

export async function createProject(
  userId: string,
  name: string,
  description: string | undefined,
  primary_language: string
): Promise<Project> {
  const result = await db.query(
    'INSERT INTO projects (user_id, name, description, primary_language) VALUES ($1,$2,$3,$4) RETURNING *',
    [userId, name, description ?? null, primary_language]
  );
  return result.rows[0];
}

export async function updateProject(
  projectId: string,
  userId: string,
  updates: Partial<{ name: string; description: string; primary_language: string }>
): Promise<Project> {
  await getProjectById(projectId, userId); // ownership check

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (updates.name !== undefined) { fields.push(`name = $${idx++}`); values.push(updates.name); }
  if (updates.description !== undefined) { fields.push(`description = $${idx++}`); values.push(updates.description); }
  if (updates.primary_language !== undefined) { fields.push(`primary_language = $${idx++}`); values.push(updates.primary_language); }

  if (!fields.length) throw createError('No fields to update', 400);

  values.push(projectId, userId);
  const result = await db.query(
    `UPDATE projects SET ${fields.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteProject(projectId: string, userId: string): Promise<void> {
  await getProjectById(projectId, userId);
  await db.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [projectId, userId]);
}
