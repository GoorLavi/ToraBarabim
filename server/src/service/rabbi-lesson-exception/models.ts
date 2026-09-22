import { z } from 'zod';

import { lessonExceptionSchema, type LessonExceptionInput } from '../admin-lesson-exception/models';
import type { LessonAddressRecord } from '../shared/models';

export const lessonIdParamSchema = z.object({
  lessonId: z.string().trim().min(1),
});

export const exceptionIdParamSchema = z.object({
  lessonId: z.string().trim().min(1),
  exceptionId: z.coerce.number().int().positive(),
});

// The exception body shape does not depend on which side (admin or rabbi)
// is writing it, so it is reused as-is rather than redefined.
export { lessonExceptionSchema };
export type { LessonExceptionInput };

export interface LessonExceptionRecord {
  id: number;
  lessonId: string;
  date: string;
  kind: 'cancelled' | 'modified';
  reason?: string;
  startTime?: string;
  address?: LessonAddressRecord;
  substituteRabbiId?: string;
  note?: string;
}
