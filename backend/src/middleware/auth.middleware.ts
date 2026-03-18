import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/apiResponse';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'Authentication required', 401);
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.id ?? payload.userId!,
      userId: payload.userId ?? payload.id!,
      email: payload.email,
    };
    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
};
