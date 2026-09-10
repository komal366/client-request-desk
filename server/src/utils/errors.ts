import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
export class AppError extends Error { constructor(public status: number, message: string, public details?: unknown) { super(message); } }
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    const errors = Object.fromEntries(error.issues.map(issue => [String(issue.path[0] ?? 'form'), issue.message]));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  if (error instanceof AppError) return res.status(error.status).json({ success: false, message: error.message, ...(error.details ? { errors: error.details } : {}) });
  console.error(error);
  return res.status(500).json({ success: false, message: 'Unexpected server error' });
}
export function requireUser(req: Request) { if (!req.user) throw new AppError(401, 'Authentication required'); return req.user; }
