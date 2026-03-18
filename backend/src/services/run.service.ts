import { db } from '../config/db';
import { AnalysisRun, RunHistoryItem, RunType, RunStatus } from '../types';
import { createError } from '../middleware/error.middleware';

export async function getRunsByProject(projectId: string, userId: string): Promise<AnalysisRun[]> {
  const result = await db.query(
    `SELECT ar.* FROM analysis_runs ar
     JOIN projects p ON p.id = ar.project_id
     WHERE ar.project_id = $1 AND p.user_id = $2
     ORDER BY ar.created_at DESC LIMIT 50`,
    [projectId, userId]
  );
  return result.rows;
}

export async function getRunsByUser(userId: string, limit = 100): Promise<RunHistoryItem[]> {
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const result = await db.query(
    `SELECT
        ar.*,
        p.name AS project_name,
        p.primary_language AS project_language,
        pf.file_name
     FROM analysis_runs ar
     JOIN projects p ON p.id = ar.project_id
     LEFT JOIN project_files pf ON pf.id = ar.file_id
     WHERE p.user_id = $1
     ORDER BY ar.created_at DESC
     LIMIT $2`,
    [userId, safeLimit]
  );
  return result.rows;
}

export async function createRun(
  projectId: string,
  fileId: string | null,
  runType: RunType,
  inputSummary: string
): Promise<AnalysisRun> {
  const result = await db.query(
    `INSERT INTO analysis_runs (project_id, file_id, run_type, input_summary, status)
     VALUES ($1,$2,$3,$4,'running') RETURNING *`,
    [projectId, fileId, runType, inputSummary]
  );
  return result.rows[0];
}

export async function completeRun(
  runId: string,
  status: RunStatus,
  outputSummary: string,
  rawResult: Record<string, unknown>
): Promise<AnalysisRun> {
  const result = await db.query(
    `UPDATE analysis_runs
     SET status = $1, output_summary = $2, raw_result_json = $3
     WHERE id = $4 RETURNING *`,
    [status, outputSummary, JSON.stringify(rawResult), runId]
  );
  if (!result.rows[0]) throw createError('Run not found', 404);
  return result.rows[0];
}

export async function getRunById(runId: string, userId: string): Promise<AnalysisRun> {
  const result = await db.query(
    `SELECT ar.* FROM analysis_runs ar
     JOIN projects p ON p.id = ar.project_id
     WHERE ar.id = $1 AND p.user_id = $2`,
    [runId, userId]
  );
  if (!result.rows[0]) throw createError('Run not found', 404);
  return result.rows[0];
}
