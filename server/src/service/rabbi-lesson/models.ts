import type { LessonAudience, LessonTopic } from '@torabarabim/common';
import { z } from 'zod';

import { lessonPlaceSchema, recurrenceSchema, timeOfDaySchema, type LessonPlaceRecord } from '../admin-lesson/models';
import { LESSON_AUDIENCES, LESSON_TOPICS } from '../../db/schema/enums';

export const lessonIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

// No `rabbiId` field: a rabbi can only ever write his own lessons, so the
// owner is always the id on his session, never a value he sends.
export const createRabbiLessonSchema = z.object({
  title: z.string().trim().min(1).optional(),
  place: lessonPlaceSchema,
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
  place: LessonPlaceRecord;
  topic?: LessonTopic;
  audience: LessonAudience;
  recurrence: CreateRabbiLessonInput['recurrence'];
  startTime: string;
  durationMinutes: number;
  notes?: string;
}

export interface RabbiLessonListResult {
  items: RabbiLessonRecord[];
}
