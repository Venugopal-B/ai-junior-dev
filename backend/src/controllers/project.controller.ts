import { Request, Response } from 'express';
import * as projectService from '../services/project.service';
import { createProjectSchema, projectIdSchema } from '../validations/project.validation';
import { sendSuccess, sendCreated, sendSuccess as sendOk } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const projects = await projectService.getProjectsByUser(req.user!.userId);
  return sendSuccess(res, projects);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { params } = projectIdSchema.parse({ params: req.params });
  const project = await projectService.getProjectById(params.id, req.user!.userId);
  return sendSuccess(res, project);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { body } = createProjectSchema.parse({ body: req.body });
  const project = await projectService.createProject(
    req.user!.userId, body.name, body.description, body.primary_language
  );
  return sendCreated(res, project, 'Project created');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { params } = projectIdSchema.parse({ params: req.params });
  await projectService.deleteProject(params.id, req.user!.userId);
  return sendOk(res, null, 200, 'Project deleted');
});
