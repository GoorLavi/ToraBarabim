import type { Area } from '@torabarabim/common';
import { z } from 'zod';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../shared/consts';

export const rabbiListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});
export type RabbiListQuery = z.infer<typeof rabbiListQuerySchema>;

export const rabbiIdParamSchema = z.object({
  rabbiId: z.string().trim().min(1),
});
export type RabbiIdParam = z.infer<typeof rabbiIdParamSchema>;

export interface RabbiSummaryRecord {
  id: string;
  name: string;
  title?: string;
  photoUrl?: string;
  bio?: string;
}

export interface RabbiCityRecord {
  code: number;
  nameHe: string;
  area: Area;
}

// A rabbi plus its lesson count and the cities it teaches in, computed in
// one pass over a set of rabbi ids. Used for both a directory page's rows
// and a single rabbi's detail page: the two need the exact same fields.
export interface RabbiDirectoryEntryRecord extends RabbiSummaryRecord {
  lessonCount: number;
  cities: RabbiCityRecord[];
}

export interface RabbiListResult {
  items: RabbiDirectoryEntryRecord[];
  page: number;
  pageSize: number;
  total: number;
}
