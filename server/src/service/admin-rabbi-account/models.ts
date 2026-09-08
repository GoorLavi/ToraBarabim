import { z } from 'zod';

export const rabbiIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const createRabbiAccountSchema = z.object({
  email: z.string().trim().email(),
  username: z.string().trim().min(1),
});
export type CreateRabbiAccountInput = z.infer<typeof createRabbiAccountSchema>;

export const updateRabbiAccountSchema = z.object({
  isActive: z.boolean(),
});
export type UpdateRabbiAccountInput = z.infer<typeof updateRabbiAccountSchema>;

export interface RabbiAccountRecord {
  id: string;
  email: string;
  username?: string;
  rabbiId: string;
  isActive: boolean;
}

export interface CreatedRabbiAccountRecord extends RabbiAccountRecord {
  temporaryPassword: string;
}
