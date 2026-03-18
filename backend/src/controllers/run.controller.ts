import { Request, Response } from 'express';
import { getRunsByProject, getRunById, getRunsByUser } from '../services/run.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const listAll = asyncHandler(async (req: Request, res: Response) => {
  const parsedLimit = Number(req.query.limit);
  const limit = Number.isFinite(parsedLimit) ? parsedLimit : 100;
  const runs = await getRunsByUser(req.user!.userId, limit);
  return sendSuccess(res, runs);
});

export const listByProject = asyncHandler(async (req: Request, res: Response) => {
  const runs = await getRunsByProject(req.params.id, req.user!.userId);
  return sendSuccess(res, runs);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const run = await getRunById(req.params.runId, req.user!.userId);
  return sendSuccess(res, run);
});
