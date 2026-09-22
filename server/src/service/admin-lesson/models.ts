import type { LessonProvenance, LessonVenuePanel } from '@torabarabim/common';
import { z } from 'zod';

import { LESSON_AUDIENCES, LESSON_TOPICS } from '../../db/schema/enums';
import { DEFAULT_ADMIN_PAGE, DEFAULT_ADMIN_PAGE_SIZE, MAX_ADMIN_PAGE_SIZE } from '../admin-shared/consts';
import type { ResolvedLessonOccurrence } from '../lesson/models';
import { lessonVenueInputSchema, recurrenceSchema } from '../shared/models';
import { timeOfDaySchema } from '../shared/time';

export const lessonIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const lessonOccurrenceListParamsSchema = z.object({
  lessonId: z.string().trim().min(1),
});
export type LessonOccurrenceListParams = z.infer<typeof lessonOccurrenceListParamsSchema>;

// `cityId` is the city's official code (`cities.code`), the same id `GET
// /v1/cities` hands back as `City.id`.
export const lessonListQuerySchema = z.object({
  rabbiId: z.string().trim().min(1).optional(),
  cityId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_ADMIN_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_ADMIN_PAGE_SIZE).default(DEFAULT_ADMIN_PAGE_SIZE),
});
export type LessonListQuery = z.infer<typeof lessonListQuerySchema>;

export { recurrenceSchema, timeOfDaySchema };

export const createLessonSchema = z.object({
  title: z.string().trim().min(1).optional(),
  rabbiId: z.string().trim().min(1),
  venue: lessonVenueInputSchema,
  topic: z.enum(LESSON_TOPICS).optional(),
  audience: z.enum(LESSON_AUDIENCES),
  recurrence: recurrenceSchema,
  startTime: timeOfDaySchema,
  durationMinutes: z.number().int().positive(),
  notes: z.string().trim().min(1).optional(),
});
export type CreateLessonInput = z.infer<typeof createLessonSchema>;

// A partial update could mix a 'weekly' recurrenceKind with a leftover
// 'once' date, a state the recurrence schema is built to reject. Updates
// are a full replacement instead of a merge, matching `UpdateLessonRequest`.
export const updateLessonSchema = createLessonSchema;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

export interface LessonRecord {
  id: string;
  title?: string;
  rabbiId: string;
  venue: LessonVenuePanel;
  topic?: (typeof LESSON_TOPICS)[number];
  audience: (typeof LESSON_AUDIENCES)[number];
  recurrence: CreateLessonInput['recurrence'];
  startTime: string;
  durationMinutes: number;
  notes?: string;
  provenance: LessonProvenance;
}

export interface LessonListResult {
  items: LessonRecord[];
  page: number;
  pageSize: number;
  total: number;
}

// One lesson's recurrence rule expanded across the same window as a
// rabbi's own upcoming occurrences, so an admin can see exactly what a
// cancel or a move on this lesson would act on. `ResolvedLessonOccurrence`
// is reused, not redefined: the shape an admin needs here is identical to
// what the public search and a rabbi's own occurrences already produce.
export interface AdminOccurrenceListResult {
  items: ResolvedLessonOccurrence[];
}
