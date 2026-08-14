import type { Weekday } from '@torabarabim/common';
import { z } from 'zod';

import { LESSON_AUDIENCES, LESSON_TOPICS } from '../../db/schema/enums';
import { DEFAULT_ADMIN_PAGE, DEFAULT_ADMIN_PAGE_SIZE, MAX_ADMIN_PAGE_SIZE } from '../admin-shared/consts';

export const lessonIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const lessonListQuerySchema = z.object({
  rabbiId: z.string().trim().min(1).optional(),
  placeId: z.string().trim().min(1).optional(),
  cityId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_ADMIN_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_ADMIN_PAGE_SIZE).default(DEFAULT_ADMIN_PAGE_SIZE),
});
export type LessonListQuery = z.infer<typeof lessonListQuerySchema>;

// 'HH:mm', zero-padded, 24-hour.
export const timeOfDaySchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "expected 'HH:mm'");

const weekdaySchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]) satisfies z.ZodType<Weekday>;

// Mirrors the `lessons_recurrence_shape` CHECK constraint exactly: 'weekly'
// carries weekdays and no date, 'once' carries a date and no weekdays, so
// the two can never disagree.
export const recurrenceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('weekly'), weekdays: z.array(weekdaySchema).min(1) }),
  z.object({ kind: z.literal('once'), date: z.iso.date() }),
]);

export const createLessonSchema = z.object({
  title: z.string().trim().min(1).optional(),
  rabbiId: z.string().trim().min(1),
  placeId: z.string().trim().min(1),
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
  placeId: string;
  topic?: (typeof LESSON_TOPICS)[number];
  audience: (typeof LESSON_AUDIENCES)[number];
  recurrence: CreateLessonInput['recurrence'];
  startTime: string;
  durationMinutes: number;
  notes?: string;
}

export interface LessonListResult {
  items: LessonRecord[];
  page: number;
  pageSize: number;
  total: number;
}
