import type { LessonAudience, LessonProvenance, LessonTopic, LessonVenue } from '@torabarabim/common';
import { z } from 'zod';

import { LESSON_AUDIENCES, LESSON_TOPICS } from '../../db/schema/enums';
import { lessonVenueInputSchema, recurrenceSchema } from '../shared/models';
import { timeOfDaySchema } from '../shared/time';
import { DEFAULT_RABBI_PAGE, DEFAULT_RABBI_PAGE_SIZE, MAX_RABBI_PAGE_SIZE } from './consts';

export const lessonIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const rabbiLessonListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_RABBI_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_RABBI_PAGE_SIZE).default(DEFAULT_RABBI_PAGE_SIZE),
});
export type RabbiLessonListQuery = z.infer<typeof rabbiLessonListQuerySchema>;

// No `rabbiId` field: a rabbi can only ever write his own lessons, so the
// owner is always the id on his session, never a value he sends.
export const createRabbiLessonSchema = z.object({
  title: z.string().trim().min(1).optional(),
  venue: lessonVenueInputSchema,
  topic: z.enum(LESSON_TOPICS).optional(),
  audience: z.enum(LESSON_AUDIENCES),
  recurrence: recurrenceSchema,
  startTime: timeOfDaySchema,
  durationMinutes: z.number().int().positive(),
  notes: z.string().trim().min(1).optional(),
});
export type CreateRabbiLessonInput = z.infer<typeof createRabbiLessonSchema>;

// Updates are a full replacement, matching the admin lesson contract:
// a partial update could mix a 'weekly' recurrenceKind with a leftover
// 'once' date, a state the recurrence schema is built to reject.
export const updateRabbiLessonSchema = createRabbiLessonSchema;
export type UpdateRabbiLessonInput = z.infer<typeof updateRabbiLessonSchema>;

export interface RabbiLessonRecord {
  id: string;
  title?: string;
  rabbiId: string;
  venue: LessonVenue;
  topic?: LessonTopic;
  audience: LessonAudience;
  recurrence: CreateRabbiLessonInput['recurrence'];
  startTime: string;
  durationMinutes: number;
  notes?: string;
  // `RabbiLessonResponse` is `LessonResponse` (see `common/src/rabbi-portal.ts`),
  // which carries `provenance`, so a rabbi's own lesson view surfaces it
  // too: harmless to show him that a lesson of his came from the weekly
  // import, and keeps the two response shapes genuinely interchangeable.
  provenance: LessonProvenance;
}

export interface RabbiLessonListResult {
  items: RabbiLessonRecord[];
  page: number;
  pageSize: number;
  total: number;
}
