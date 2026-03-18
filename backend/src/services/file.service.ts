import { db } from '../config/db';
import { ProjectFile } from '../types';
import { createError } from '../middleware/error.middleware';

async function assertProjectOwnership(projectId: string, userId: string): Promise<void> {
  const proj = await db.query('SELECT id FROM projects WHERE id = $1 AND user_id = $2', [projectId, userId]);
  if (!proj.rows[0]) throw createError('Project not found', 404);
}

async function assertUniqueFileName(projectId: string, fileName: string, excludeFileId?: string): Promise<void> {
  const result = await db.query(
    `SELECT id FROM project_files
     WHERE project_id = $1
       AND LOWER(file_name) = LOWER($2)
       AND ($3::uuid IS NULL OR id <> $3::uuid)
     LIMIT 1`,
    [projectId, fileName, excludeFileId ?? null]
  );

  if (result.rows[0]) {
    throw createError('A file with that name already exists in this project', 409);
  }
}

export async function getFilesByProject(projectId: string, userId: string): Promise<ProjectFile[]> {
  // Verify ownership via join
  const result = await db.query(
    `SELECT pf.* FROM project_files pf
     JOIN projects p ON p.id = pf.project_id
     WHERE pf.project_id = $1 AND p.user_id = $2
     ORDER BY pf.file_name`,
    [projectId, userId]
  );
  return result.rows;
}

export async function getFileById(fileId: string, userId: string): Promise<ProjectFile> {
  const result = await db.query(
    `SELECT pf.* FROM project_files pf
     JOIN projects p ON p.id = pf.project_id
     WHERE pf.id = $1 AND p.user_id = $2`,
    [fileId, userId]
  );
  if (!result.rows[0]) throw createError('File not found', 404);
  return result.rows[0];
}

export async function createFile(
  projectId: string,
  userId: string,
  file_name: string,
  file_path: string,
  content: string,
  language: string
): Promise<ProjectFile> {
  await assertProjectOwnership(projectId, userId);
  await assertUniqueFileName(projectId, file_name);

  const result = await db.query(
    'INSERT INTO project_files (project_id, file_name, file_path, content, language) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [projectId, file_name, file_path, content, language]
  );
  return result.rows[0];
}

export async function updateFileContent(fileId: string, userId: string, content: string): Promise<ProjectFile> {
  const file = await getFileById(fileId, userId);
  const result = await db.query(
    'UPDATE project_files SET content = $1 WHERE id = $2 RETURNING *',
    [content, file.id]
  );
  return result.rows[0];
}

export async function deleteFile(fileId: string, userId: string): Promise<void> {
  await getFileById(fileId, userId);
  await db.query('DELETE FROM project_files WHERE id = $1', [fileId]);
}
