import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AppError } from './errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

export function loginHandler(req: Request, res: Response): void {
  const { username, password } = req.body || {};
  if (!username || !password) throw new AppError(400, 'username and password are required');

  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    throw new AppError(401, 'Invalid credentials');
  }

  const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) throw new AppError(401, 'Missing or invalid token');

  try {
    const token = header.slice(7);
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
}
