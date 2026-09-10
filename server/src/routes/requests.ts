import { Router } from 'express';
import { prisma } from '../config/prisma';
import { mockAuthMiddleware } from '../middleware/auth';
import { requestSchema, updateRequestSchema } from '../validators/schemas';
import { AppError, requireUser } from '../utils/errors';
export const requestRouter = Router();
requestRouter.use(mockAuthMiddleware);
const publicRequest = { workItem: true, activities: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' as const } } };
requestRouter.get('/', async (req, res, next) => {
  try {
    const user = requireUser(req); const status = typeof req.query.status === 'string' ? req.query.status : undefined; const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const requests = await prisma.customerRequest.findMany({ where: { workspaceId: user.workspaceId, ...(status && ['NEW', 'QUALIFIED', 'CLOSED'].includes(status) ? { status: status as 'NEW' | 'QUALIFIED' | 'CLOSED' } : {}), ...(search ? { OR: [{ customerName: { contains: search } }, { requestedService: { contains: search } }] } : {}) }, orderBy: { createdAt: 'desc' }, include: { workItem: true } });
    res.json({ success: true, data: requests });
  } catch (error) { next(error); }
});
requestRouter.post('/', async (req, res, next) => {
  try { const user = requireUser(req); const data = requestSchema.parse(req.body); const request = await prisma.customerRequest.create({ data: { ...data, workspaceId: user.workspaceId }, include: publicRequest }); await prisma.activity.create({ data: { workspaceId: user.workspaceId, requestId: request.id, userId: user.id, action: 'Request created', description: `New request from ${data.customerName}` } }); res.status(201).json({ success: true, data: request }); } catch (error) { next(error); }
});
requestRouter.get('/:id', async (req, res, next) => {
  try { const user = requireUser(req); const request = await prisma.customerRequest.findFirst({ where: { id: req.params.id, workspaceId: user.workspaceId }, include: publicRequest }); if (!request) throw new AppError(404, 'Request not found'); res.json({ success: true, data: request }); } catch (error) { next(error); }
});
requestRouter.patch('/:id', async (req, res, next) => {
  try { const user = requireUser(req); const data = updateRequestSchema.parse(req.body); const existing = await prisma.customerRequest.findFirst({ where: { id: req.params.id, workspaceId: user.workspaceId } }); if (!existing) throw new AppError(404, 'Request not found'); const updated = await prisma.customerRequest.update({ where: { id: existing.id }, data, include: publicRequest }); await prisma.activity.create({ data: { workspaceId: user.workspaceId, requestId: existing.id, userId: user.id, action: 'Request updated', description: existing.status !== updated.status ? `Status changed from ${existing.status} to ${updated.status}` : 'Request details were updated' } }); res.json({ success: true, data: updated }); } catch (error) { next(error); }
});
requestRouter.get('/:id/activity', async (req, res, next) => {
  try { const user = requireUser(req); const request = await prisma.customerRequest.findFirst({ where: { id: req.params.id, workspaceId: user.workspaceId }, select: { id: true } }); if (!request) throw new AppError(404, 'Request not found'); const activities = await prisma.activity.findMany({ where: { requestId: request.id, workspaceId: user.workspaceId }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }); res.json({ success: true, data: activities }); } catch (error) { next(error); }
});
requestRouter.post('/:id/convert', async (req, res, next) => {
  try {
    const user = requireUser(req);
    const request = await prisma.customerRequest.findFirst({ where: { id: req.params.id, workspaceId: user.workspaceId } });
    if (!request) throw new AppError(404, 'Request not found');
    if (request.status === 'NEW') throw new AppError(400, 'Only qualified requests can be converted into a work item.');
    if (request.status === 'CLOSED') throw new AppError(400, 'Closed requests cannot be converted into a work item.');
    const existing = await prisma.workItem.findUnique({ where: { requestId: request.id } });
    if (existing) throw new AppError(409, 'This request has already been converted into a work item.');
    const result = await prisma.$transaction(async (tx) => {
      const workItem = await tx.workItem.create({ data: { workspaceId: user.workspaceId, requestId: request.id, customerName: request.customerName, service: request.requestedService, scheduledDate: request.scheduledDate } });
      await tx.activity.create({ data: { workspaceId: user.workspaceId, requestId: request.id, userId: user.id, action: 'Work item created', description: `${request.requestedService} moved into work items` } });
      return workItem;
    });
    res.status(201).json({ success: true, data: result });
  } catch (error: any) { if (error?.code === 'P2002') return next(new AppError(409, 'This request has already been converted into a work item.')); next(error); }
});
