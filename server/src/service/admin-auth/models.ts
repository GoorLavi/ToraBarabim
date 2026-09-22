import { z } from 'zod';

import type { AdminRole } from '../../db/schema/enums';

export const loginRequestSchema = z.object({
  // An email or a username: the row is looked up by either. Left as a
  // plain trimmed string since a username is not an email shape.
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

// The shared panel door (`POST /v1/panel/login`) additionally accepts the
// client's stored redirect target. Its shape is not validated further
// here: `resolveLandingPath` decides whether it is safe to honour.
export const panelLoginRequestSchema = loginRequestSchema.extend({
  from: z.string().optional(),
});

export type PanelLoginRequest = z.infer<typeof panelLoginRequestSchema>;

export interface AuthenticatedAdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  rabbiId?: string;
  placeId?: string;
  isActive: boolean;
  isSuper: boolean;
  passwordHash: string;
}
