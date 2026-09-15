import type { Area, Rabbi } from '@torabarabim/common';
import { z } from 'zod';

export const citySearchQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
});

export type CitySearchQuery = z.infer<typeof citySearchQuerySchema>;

export const citySlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(100),
});

export type CitySlugParam = z.infer<typeof citySlugParamSchema>;

export interface ResolvedCity {
  code: number;
  nameHe: string;
  slug: string;
  area: Area;
}

export interface CityWithLessonCount extends ResolvedCity {
  lessonCount: number;
}

export interface CitySearchResult extends CityWithLessonCount {
  areaName: string;
}

export interface CityAreaGroup {
  area: Area;
  areaName: string;
  slug: string;
  cities: CityWithLessonCount[];
}

// Only cities with at least one lesson appear here, grouped only under
// areas that have at least one such city.
export interface CityDirectoryResult {
  areas: CityAreaGroup[];
}

export interface CityAreaSuggestionGroup extends CityAreaGroup {
  areaLessonCount: number;
}

// Same filtering as `CityDirectoryResult`, ordered by lesson supply instead
// of alphabetically, with no cap on cities per area.
export interface CitySuggestionsResult {
  areas: CityAreaSuggestionGroup[];
}

export interface CityDetailResult extends ResolvedCity {
  areaName: string;
  areaSlug: string;
  rabbis: Rabbi[];
}
