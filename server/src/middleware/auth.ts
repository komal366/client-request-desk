import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
export async function mockAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = req.header('x-user-id');
  if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ success: false, message: 'Invalid demo user' });
  req.user = user;
  next();
}
