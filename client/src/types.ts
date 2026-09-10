export type Status = 'NEW' | 'QUALIFIED' | 'CLOSED';
export type User = { id: string; name: string; email: string; workspaceId?: string };
export type Workspace = { id: string; name: string };
export type RequestItem = { id: string; customerName: string; customerEmail: string; requestedService: string; description: string; scheduledDate: string; status: Status; createdAt: string; updatedAt: string; workItem?: WorkItem | null; activities?: Activity[] };
export type WorkItem = { id: string; requestId: string; customerName: string; service: string; scheduledDate: string; status: string; createdAt: string };
export type Activity = { id: string; action: string; description: string; createdAt: string; user: { name: string } };
