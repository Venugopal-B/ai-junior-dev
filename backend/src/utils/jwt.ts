import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  id?: string;
  userId?: string;
  email: string;
}

export const signToken = (payload: TokenPayload): string => {
  const normalizedPayload = {
    id: payload.id ?? payload.userId,
    userId: payload.userId ?? payload.id,
    email: payload.email,
  };

  return jwt.sign(normalizedPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): TokenPayload => {
  const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  return {
    id: payload.id ?? payload.userId,
    userId: payload.userId ?? payload.id,
    email: payload.email,
  };
};
