import type { Area, Rabbi } from '@torabarabim/common';
import { z } from 'zod';

export const citySearchQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
});

export type CitySearchQuery = z.infer<typeof citySearchQuerySchema>;

export const cityNameParamSchema = z.object({
  name: z.string().trim().min(1).max(200),
});

export type CityNameParam = z.infer<typeof cityNameParamSchema>;

export interface ResolvedCity {
  code: number;
  nameHe: string;
  area: Area;
}

export interface CityWithLessonCount extends ResolvedCity {
  lessonCount: number;
}

export interface CityAreaGroup {
  area: Area;
  areaName: string;
  cities: CityWithLessonCount[];
}

// Only cities with at least one lesson appear here, grouped only under
// areas that have at least one such city.
export interface CityDirectoryResult {
  areas: CityAreaGroup[];
}

export interface CityDetailResult extends ResolvedCity {
  areaName: string;
  rabbis: Rabbi[];
}
