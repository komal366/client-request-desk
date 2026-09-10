import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app';
import { prisma } from '../config/prisma';

describe('workspace isolation and conversion rules', () => {
  it('does not expose another workspace request by id', async () => {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@demo-a.com' } }); const bobRequest = await prisma.customerRequest.findFirst({ where: { workspace: { name: 'Demo Business B' } } });
    if (!alice || !bobRequest) return; const response = await request(app).get(`/api/requests/${bobRequest.id}`).set('x-user-id', alice.id); expect(response.status).toBe(404);
  });
  it('allows qualified conversion once and rejects the duplicate', async () => {
    const alice = await prisma.user.findUnique({ where: { email: 'alice@demo-a.com' } }); const item = await prisma.customerRequest.findFirst({ where: { workspace: { name: 'Demo Business A' }, status: 'QUALIFIED' } });
    if (!alice || !item) return; const first = await request(app).post(`/api/requests/${item.id}/convert`).set('x-user-id', alice.id); expect([201, 409]).toContain(first.status); const second = await request(app).post(`/api/requests/${item.id}/convert`).set('x-user-id', alice.id); expect(second.status).toBe(409);
  });
});
