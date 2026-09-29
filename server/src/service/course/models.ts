import type { CourseTeacher, CourseTopic, LessonAudience, LessonVenue } from '@torabarabim/common';
import { z } from 'zod';

import type { CourseLifecycleResult } from './lifecycle';

// `GET /v1/courses/:courseId`'s own param, kept distinct in name from the
// panels' `id` (`panelCourseIdParamSchema` in `service/shared/models.ts`):
// the two routes are never confused for one another this way, even by a
// stack trace.
export const coursePageParamSchema = z.object({ courseId: z.string().trim().min(1) });
export type CoursePageParam = z.infer<typeof coursePageParamSchema>;

// The public card/row shape's own fields, before the convertor turns the
// cover key into a URL and the lifecycle into the wire `CourseState`.
export interface CourseSummaryRecord {
  id: string;
  slug: string;
  name: string;
  cycle?: number;
  coverKey: string;
  openingDate: string;
  teacher: CourseTeacher;
  venue: LessonVenue;
  audience: LessonAudience;
  lifecycle: CourseLifecycleResult;
}

export interface CourseDetailRecord extends CourseSummaryRecord {
  description: string;
  weeks: number;
  sessions: number;
  hours?: number;
  priceShekels?: number;
  contactPhone: string;
  topic?: CourseTopic;
  photos: { id: string; storageKey: string }[];
}
