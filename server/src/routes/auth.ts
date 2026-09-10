import { Router } from 'express';
import { prisma } from '../config/prisma';
import { loginSchema } from '../validators/schemas';
import { AppError } from '../utils/errors';
export const authRouter = Router();
authRouter.post('/login', async (req, res, next) => {
  try {
    const { userId } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { workspace: true } });
    if (!user) throw new AppError(401, 'Invalid demo user');
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email }, workspace: user.workspace });
  } catch (error) { next(error); }
});
