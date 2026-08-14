import type { Area } from '@torabarabim/common';
import { z } from 'zod';

import { DEFAULT_ADMIN_PAGE, DEFAULT_ADMIN_PAGE_SIZE, MAX_ADMIN_PAGE_SIZE } from '../admin-shared/consts';

export const placeIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const placeListQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  cityId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_ADMIN_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_ADMIN_PAGE_SIZE).default(DEFAULT_ADMIN_PAGE_SIZE),
});
export type PlaceListQuery = z.infer<typeof placeListQuerySchema>;

// `cityId` is the city's official code as a string, the same id `GET
// /v1/cities` hands back as `City.id`. It is resolved, never created.
export const createPlaceSchema = z.object({
  name: z.string().trim().min(1),
  address: z.string().trim().min(1),
  cityId: z.string().trim().min(1),
});
export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;

export const updatePlaceSchema = createPlaceSchema.partial();
export type UpdatePlaceInput = z.infer<typeof updatePlaceSchema>;

// `z.coerce.boolean()` would treat the string 'false' as truthy (it just
// runs `Boolean(value)`), which is exactly wrong for a destructive-delete
// guard. Only the literal string 'true' confirms; anything else, including
// absence, does not.
export const deletePlaceQuerySchema = z.object({
  confirm: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
});
export type DeletePlaceQuery = z.infer<typeof deletePlaceQuerySchema>;

export interface PlaceRecord {
  id: string;
  name: string;
  address: string;
  city: string;
  area: Area;
  cityId: number;
}

export interface PlaceListResult {
  items: PlaceRecord[];
  page: number;
  pageSize: number;
  total: number;
}

export interface DeletePlacePreviewResult {
  lessonCount: number;
  exceptionCount: number;
}
