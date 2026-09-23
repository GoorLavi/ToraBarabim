import type { Area } from '@torabarabim/common';
import { z } from 'zod';

export const placeIdParamSchema = z.object({
  id: z.string().trim().min(1),
});
export type PlaceIdParam = z.infer<typeof placeIdParamSchema>;

// `cityCode` is required: "resembling" never crosses cities (see
// `isSimilarAddress`). `name` and `street` are both optional since the
// hint fires as soon as either field the form already has is typed, before
// the other one is.
export const similarPlaceQuerySchema = z.object({
  cityCode: z.coerce.number().int().positive(),
  name: z.string().trim().min(1).optional(),
  street: z.string().trim().min(1).optional(),
});
export type SimilarPlaceQuery = z.infer<typeof similarPlaceQuerySchema>;

export interface PlaceRecord {
  id: string;
  slug: string;
  name: string;
  street: string;
  floor?: string;
  cityCode: number;
  cityName: string;
  citySlug: string;
  area: Area;
  photoUrl?: string;
  // General-scope lesson count: see `loadPlaceLessonCounts` in `place.ts`
  // for what it counts and why a rabbanit's lesson is excluded.
  lessonCount: number;
}

export interface PlaceListResult {
  items: PlaceRecord[];
}
