import type { Area } from '@torabarabim/common';
import { z } from 'zod';

import type { CityWithLessonCount } from '../city/models';

export const areaSlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(100),
});

export type AreaSlugParam = z.infer<typeof areaSlugParamSchema>;

export interface AreaSummary {
  area: Area;
  areaName: string;
  slug: string;
  cityCount: number;
  lessonCount: number;
}

// Only areas that have at least one city with a lesson appear here, mirroring
// the city directory's own filter.
export interface AreaDirectoryResult {
  areas: AreaSummary[];
}

export interface AreaDetailResult {
  area: Area;
  areaName: string;
  slug: string;
  cities: CityWithLessonCount[];
}
