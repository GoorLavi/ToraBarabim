import type { CourseTeacher, CourseTopic, LessonAudience, LessonVenue } from '@torabarabim/common';

import type { CourseLifecycleResult } from './lifecycle';

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

export interface HomeCourseRowResult {
  title: string;
  items: CourseSummaryRecord[];
}
