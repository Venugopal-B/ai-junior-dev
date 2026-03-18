import bcrypt from 'bcryptjs';
import { db } from '../config/db';
import { signToken } from '../utils/jwt';
import { User, AuthTokens } from '../types';
import { createError } from '../middleware/error.middleware';

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ user: Omit<User, 'password_hash'>; tokens: AuthTokens }> {
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw createError('Email already registered', 409);
  }

  const password_hash = await bcrypt.hash(password, 12);

  const result = await db.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at, updated_at',
    [name, email, password_hash]
  );

  const user = result.rows[0] as Omit<User, 'password_hash'>;
  const tokens: AuthTokens = { accessToken: signToken({ userId: user.id, email: user.email }) };
  return { user, tokens };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: Omit<User, 'password_hash'>; tokens: AuthTokens }> {
  const result = await db.query(
    'SELECT id, name, email, password_hash, created_at, updated_at FROM users WHERE email = $1',
    [email]
  );

  const user = result.rows[0] as User | undefined;
  if (!user) throw createError('Invalid email or password', 401);

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw createError('Invalid email or password', 401);

  const { password_hash: _ph, ...safeUser } = user;
  const tokens: AuthTokens = { accessToken: signToken({ userId: user.id, email: user.email }) };
  return { user: safeUser, tokens };
}

export async function getUserById(userId: string): Promise<Omit<User, 'password_hash'> | null> {
  const result = await db.query(
    'SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] ?? null;
}
