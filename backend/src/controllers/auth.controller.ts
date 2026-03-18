import { Request, Response } from 'express';
import { registerUser, loginUser, getUserById } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validations/auth.validation';
import { sendSuccess, sendCreated } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { body } = registerSchema.parse({ body: req.body });
  const result = await registerUser(body.name, body.email, body.password);
  sendCreated(res, result, 'Account created successfully');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { body } = loginSchema.parse({ body: req.body });
  const result = await loginUser(body.email, body.password);
  sendSuccess(res, result, 200, 'Login successful');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await getUserById(req.user!.userId);
  sendSuccess(res, user);
});
