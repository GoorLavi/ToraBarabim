import type { Area, RabbiHonorific } from '@torabarabim/common';
import { z } from 'zod';

import { AUDIENCE_SCOPES, DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../shared/consts';

// `general` lists ravs only, `women` lists rabbaniyot only. Zod's default
// makes the parsed type required, so every call site names its scope
// rather than one accidentally reading everyone.
export const rabbiListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  scope: z.enum(AUDIENCE_SCOPES).default('general'),
});
export type RabbiListQuery = z.infer<typeof rabbiListQuerySchema>;

export const rabbiIdParamSchema = z.object({
  rabbiId: z.string().trim().min(1),
});
export type RabbiIdParam = z.infer<typeof rabbiIdParamSchema>;

export interface RabbiSummaryRecord {
  id: string;
  name: string;
  honorific: RabbiHonorific;
  // Derived from `name` with `toSlug`, falling back to `id` when that comes
  // out empty. Never empty. The id, not the slug, is what makes the URL
  // unique, so two rabbis sharing a name sharing a slug is not a correctness
  // problem.
  slug: string;
  title?: string;
  photoUrl?: string;
  bio?: string;
}

export interface RabbiCityRecord {
  code: number;
  nameHe: string;
  slug: string;
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
