import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const requests = [
  ['Website redesign', 'A full refresh of the company website with clearer service pages.', 'QUALIFIED'], ['Mobile app consultation', 'Explore a customer portal for booking and updates.', 'NEW'], ['Data dashboard setup', 'Build a weekly sales dashboard for the leadership team.', 'QUALIFIED'], ['SEO consultation', 'Improve local search visibility for core services.', 'CLOSED']
] as const;
const otherRequests = [
  ['Logo design', 'Create a memorable identity for a growing studio.', 'QUALIFIED'], ['Website maintenance', 'Monthly updates, backups, and accessibility checks.', 'NEW'], ['Social media management', 'Plan and publish a consistent monthly content calendar.', 'NEW'], ['E-commerce setup', 'Launch a small online shop with secure checkout.', 'CLOSED']
] as const;
async function seedWorkspace(name: string, userName: string, email: string, rows: readonly (readonly [string, string, 'NEW' | 'QUALIFIED' | 'CLOSED'])[]) {
  const workspaceId = userName === 'Alice' ? 'workspace-demo-a' : 'workspace-demo-b';
  const userId = userName === 'Alice' ? 'user-alice' : 'user-bob';
  const workspace = await prisma.workspace.create({ data: { id: workspaceId, name } });
  const user = await prisma.user.create({ data: { id: userId, name: userName, email, workspaceId: workspace.id } });
  for (const [service, description, status] of rows) { const request = await prisma.customerRequest.create({ data: { workspaceId: workspace.id, customerName: `${userName === 'Alice' ? 'Jordan' : 'Morgan'} ${service.split(' ')[0]}`, customerEmail: `customer${service.length}@example.com`, requestedService: service, description, scheduledDate: new Date('2026-09-15T09:00:00Z'), status } }); await prisma.activity.create({ data: { workspaceId: workspace.id, requestId: request.id, userId: user.id, action: 'Request created', description: `New ${service.toLowerCase()} request received` } }); }
}
async function main() { await prisma.activity.deleteMany(); await prisma.workItem.deleteMany(); await prisma.customerRequest.deleteMany(); await prisma.user.deleteMany(); await prisma.workspace.deleteMany(); await seedWorkspace('Demo Business A', 'Alice', 'alice@demo-a.com', requests); await seedWorkspace('Demo Business B', 'Bob', 'bob@demo-b.com', otherRequests); }
main().finally(() => prisma.$disconnect());
