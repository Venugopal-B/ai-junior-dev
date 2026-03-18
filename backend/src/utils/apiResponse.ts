import { Response } from 'express';
import { ApiResponse } from '../types';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, message?: string): void {
  const payload: ApiResponse<T> = { success: true, data };
  if (message) payload.message = message;
  res.status(statusCode).json(payload);
}

export function sendCreated<T>(res: Response, data: T, message?: string): void {
  sendSuccess(res, data, 201, message);
}

export function sendError(res: Response, message: string, statusCode = 400, errors?: Array<{ field: string; message: string }>): void {
  const payload: ApiResponse = { success: false, message };
  if (errors) payload.errors = errors;
  res.status(statusCode).json(payload);
}

export function sendNotFound(res: Response, resource = 'Resource'): void {
  sendError(res, `${resource} not found`, 404);
}

export function sendUnauthorized(res: Response, message = 'Unauthorized'): void {
  sendError(res, message, 401);
}

export function sendForbidden(res: Response, message = 'Forbidden'): void {
  sendError(res, message, 403);
}

export function sendServerError(res: Response, message = 'Internal server error'): void {
  sendError(res, message, 500);
}