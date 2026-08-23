import type { RabbiProminence } from '@torabarabim/common';
import { z } from 'zod';

import { RABBI_PROMINENCES } from '../../db/schema/enums';
import { DEFAULT_ADMIN_PAGE, DEFAULT_ADMIN_PAGE_SIZE, MAX_ADMIN_PAGE_SIZE } from '../admin-shared/consts';

export const rabbiIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const rabbiListQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_ADMIN_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_ADMIN_PAGE_SIZE).default(DEFAULT_ADMIN_PAGE_SIZE),
});
export type RabbiListQuery = z.infer<typeof rabbiListQuerySchema>;

// Name, title, and bio only: `photoUrl` is set exclusively via the
// dedicated photo upload endpoint, never by handing the server an arbitrary URL.
export const createRabbiSchema = z.object({
  name: z.string().trim().min(1),
  title: z.string().trim().min(1).optional(),
  bio: z.string().trim().min(1).optional(),
  prominence: z.enum(RABBI_PROMINENCES).optional(),
});
export type CreateRabbiInput = z.infer<typeof createRabbiSchema>;

// A partial patch, not `createRabbiSchema.partial()`: `title` and `bio`
// are nullable columns, so the update contract needs three states, not
// two. Omitting the key leaves the column as is (the key is then absent
// from the parsed object, and the service's `.set({ ...input })` never
// mentions that column, which Drizzle interprets as "do not touch"). An
// explicit `null` clears it. An empty string is rejected by `min(1)`,
// exactly as it is on create, so there is exactly one way to say "clear
// this field" and it is never confused with "leave it alone".
export const updateRabbiSchema = z.object({
  name: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).nullable().optional(),
  bio: z.string().trim().min(1).nullable().optional(),
  prominence: z.enum(RABBI_PROMINENCES).optional(),
});
export type UpdateRabbiInput = z.infer<typeof updateRabbiSchema>;

// `z.coerce.boolean()` would treat the string 'false' as truthy (it just
// runs `Boolean(value)`), which is exactly wrong for a destructive-delete
// guard. Only the literal string 'true' confirms; anything else, including
// absence, does not.
export const deleteRabbiQuerySchema = z.object({
  confirm: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
});
export type DeleteRabbiQuery = z.infer<typeof deleteRabbiQuerySchema>;

export interface RabbiRecord {
  id: string;
  name: string;
  title?: string;
  photoUrl?: string;
  bio?: string;
  prominence: RabbiProminence;
}

export interface RabbiListResult {
  items: RabbiRecord[];
  page: number;
  pageSize: number;
  total: number;
}

export interface DeleteRabbiPreviewResult {
  lessonCount: number;
  exceptionCount: number;
}
