import { z } from 'zod';

import type { AdminRole } from '../../db/schema/enums';

export const loginRequestSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export interface AuthenticatedAdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  rabbiId?: string;
  isActive: boolean;
  passwordHash: string;
}
