import { z } from 'zod';

import { timeOfDaySchema } from '../admin-lesson/models';

export const lessonIdParamSchema = z.object({
  lessonId: z.string().trim().min(1),
});

export const exceptionIdParamSchema = z.object({
  lessonId: z.string().trim().min(1),
  exceptionId: z.coerce.number().int().positive(),
});

// Mirrors the `lesson_exceptions_shape` CHECK constraint exactly: 'cancelled'
// carries only a reason, 'modified' carries no reason, so the two can never
// disagree.
export const lessonExceptionSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('cancelled'),
    date: z.iso.date(),
    reason: z.string().trim().min(1).optional(),
  }),
  z.object({
    kind: z.literal('modified'),
    date: z.iso.date(),
    startTime: timeOfDaySchema.optional(),
    placeId: z.string().trim().min(1).optional(),
    substituteRabbiId: z.string().trim().min(1).optional(),
    note: z.string().trim().min(1).optional(),
  }),
]);
export type LessonExceptionInput = z.infer<typeof lessonExceptionSchema>;

export interface LessonExceptionRecord {
  id: number;
  lessonId: string;
  date: string;
  kind: 'cancelled' | 'modified';
  reason?: string;
  startTime?: string;
  placeId?: string;
  substituteRabbiId?: string;
  note?: string;
}
