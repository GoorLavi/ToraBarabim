import type { Area } from '@torabarabim/common';
import { z } from 'zod';

import { DEFAULT_ADMIN_PAGE, DEFAULT_ADMIN_PAGE_SIZE, MAX_ADMIN_PAGE_SIZE } from '../admin-shared/consts';

export const placeIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const placeListQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_ADMIN_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_ADMIN_PAGE_SIZE).default(DEFAULT_ADMIN_PAGE_SIZE),
});
export type PlaceListQuery = z.infer<typeof placeListQuerySchema>;

export const createPlaceSchema = z.object({
  name: z.string().trim().min(1),
  street: z.string().trim().min(1),
  floor: z.string().trim().min(1).optional(),
  cityCode: z.number().int().positive(),
});
export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;

// A partial patch: omitting `floor` leaves it as is (absent from the
// parsed object, so `.set({ ...input })` never mentions that column, which
// Drizzle interprets as "do not touch"), `null` clears it, a non-empty
// string sets it. `isActive` is the entire delete mechanism (0004): there
// is no delete route, only this flag, toggled through the same update as
// every other field.
export const updatePlaceSchema = z.object({
  name: z.string().trim().min(1).optional(),
  street: z.string().trim().min(1).optional(),
  floor: z.string().trim().min(1).nullable().optional(),
  cityCode: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});
export type UpdatePlaceInput = z.infer<typeof updatePlaceSchema>;

export interface AdminPlaceRecord {
  id: string;
  slug: string;
  name: string;
  street: string;
  floor?: string;
  cityCode: number;
  cityName: string;
  area: Area;
  photoUrl?: string;
  isActive: boolean;
}

export interface AdminPlaceListResult {
  items: AdminPlaceRecord[];
  page: number;
  pageSize: number;
  total: number;
}

export const createPlaceAccountSchema = z.object({
  email: z.string().trim().email(),
  username: z.string().trim().min(1),
});
export type CreatePlaceAccountInput = z.infer<typeof createPlaceAccountSchema>;

export const updatePlaceAccountSchema = z.object({
  isActive: z.boolean(),
});
export type UpdatePlaceAccountInput = z.infer<typeof updatePlaceAccountSchema>;

export interface PlaceAccountRecord {
  id: string;
  email: string;
  username?: string;
  placeId: string;
  isActive: boolean;
}

export interface CreatedPlaceAccountRecord extends PlaceAccountRecord {
  temporaryPassword: string;
}
