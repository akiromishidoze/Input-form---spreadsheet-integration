import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(`[${new Date().toISOString()}] ${err.message}`, err.stack);
  const status = err instanceof AppError ? err.status : 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  });
}
