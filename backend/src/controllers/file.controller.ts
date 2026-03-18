import { Request, Response } from 'express';
import * as fileService from '../services/file.service';
import { createFileSchema, fileIdSchema, updateFileSchema } from '../validations/file.validation';
import { sendSuccess, sendCreated } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const listByProject = asyncHandler(async (req: Request, res: Response) => {
  const files = await fileService.getFilesByProject(req.params.id, req.user!.userId);
  return sendSuccess(res, files);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { params } = fileIdSchema.parse({ params: req.params });
  const file = await fileService.getFileById(params.fileId, req.user!.userId);
  return sendSuccess(res, file);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { body } = createFileSchema.parse({ params: req.params, body: req.body });
  const file = await fileService.createFile(
    req.params.id, req.user!.userId,
    body.file_name, body.file_path, body.content, body.language
  );
  return sendCreated(res, file, 'File added');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { params } = fileIdSchema.parse({ params: req.params });
  await fileService.deleteFile(params.fileId, req.user!.userId);
  return sendSuccess(res, null, 200, 'File deleted');
});

export const updateContent = asyncHandler(async (req: Request, res: Response) => {
  const { params, body } = updateFileSchema.parse({ params: req.params, body: req.body });
  const file = await fileService.updateFileContent(params.fileId, req.user!.userId, body.content);
  return sendSuccess(res, file, 200, 'File saved');
});
