import type { Area, LessonAudience, LessonProvenance, LessonTopic, LessonVenuePanel, Recurrence } from '@torabarabim/common';
import { z } from 'zod';

import { LESSON_AUDIENCES, LESSON_TOPICS } from '../../db/schema/enums';
import { recurrenceSchema } from '../shared/models';
import { timeOfDaySchema } from '../shared/time';
import { DEFAULT_PLACE_PAGE, DEFAULT_PLACE_PAGE_SIZE, MAX_PLACE_PAGE_SIZE } from './consts';

export const lessonIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const placeLessonListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PLACE_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_PLACE_PAGE_SIZE).default(DEFAULT_PLACE_PAGE_SIZE),
});
export type PlaceLessonListQuery = z.infer<typeof placeLessonListQuerySchema>;

// No `venue`: the lesson is at this place by definition, so the server
// supplies it from the session (see `lesson.ts`). `.strict()` turns a
// stray `venue` in the payload into a 400 instead of silently discarding
// it, so "a place never chooses a venue" is a contract the schema enforces,
// not merely a field the UI happens not to show. `rabbiId` is explicit,
// unlike on `createRabbiLessonSchema`: a place names any rabbi, its own
// identity is never implied by the session the way a rabbi's own is.
export const createPlaceLessonSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    rabbiId: z.string().trim().min(1),
    topic: z.enum(LESSON_TOPICS).optional(),
    audience: z.enum(LESSON_AUDIENCES),
    recurrence: recurrenceSchema,
    startTime: timeOfDaySchema,
    durationMinutes: z.number().int().positive(),
    notes: z.string().trim().min(1).optional(),
  })
  .strict();
export type CreatePlaceLessonInput = z.infer<typeof createPlaceLessonSchema>;

// Updates are a full replacement, matching the admin and rabbi lesson
// contracts: a partial update could mix a 'weekly' recurrenceKind with a
// leftover 'once' date, a state the recurrence schema is built to reject.
export const updatePlaceLessonSchema = createPlaceLessonSchema;
export type UpdatePlaceLessonInput = z.infer<typeof updatePlaceLessonSchema>;

export interface PlaceLessonRecord {
  id: string;
  title?: string;
  rabbiId: string;
  venue: LessonVenuePanel;
  topic?: LessonTopic;
  audience: LessonAudience;
  recurrence: Recurrence;
  startTime: string;
  durationMinutes: number;
  notes?: string;
  provenance: LessonProvenance;
}

export interface PlaceLessonListResult {
  items: PlaceLessonRecord[];
  page: number;
  pageSize: number;
  total: number;
}

// A partial patch, the same three-state shape as `updatePlaceSchema`
// (admin-place): omit `floor` to leave it as is, `null` to clear it, a
// string to set it.
export const updatePlaceProfileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  street: z.string().trim().min(1).optional(),
  floor: z.string().trim().min(1).nullable().optional(),
  cityCode: z.number().int().positive().optional(),
});
export type UpdatePlaceProfileInput = z.infer<typeof updatePlaceProfileSchema>;

export interface PlaceProfileRecord {
  id: string;
  slug: string;
  name: string;
  street: string;
  floor?: string;
  cityCode: number;
  cityName: string;
  area: Area;
  photoUrl?: string;
}
