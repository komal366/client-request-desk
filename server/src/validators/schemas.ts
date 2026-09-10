import { z } from 'zod';
export const loginSchema = z.object({ userId: z.string().min(1) });
export const requestSchema = z.object({
  customerName: z.string().trim().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Enter a valid email'),
  requestedService: z.string().trim().min(1, 'Requested service is required'),
  description: z.string().trim().min(1, 'Description is required'),
  scheduledDate: z.coerce.date(),
  status: z.enum(['NEW', 'QUALIFIED', 'CLOSED'])
});
export const updateRequestSchema = requestSchema.partial();
