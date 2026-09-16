import type { Area } from '@torabarabim/common';

export interface WomenPageProps {
  className?: string;
}

export interface WomenLessonsParams {
  city?: string;
  area?: Area;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

// The subset of `WomenLessonsParams` that actually changes what comes back
// (never `page` or `pageSize`, which `useLessonListPages` owns): the one
// shape both the main list's and the area fallback's query keys build from.
export type WomenLessonsFilters = Pick<WomenLessonsParams, 'city' | 'area' | 'from' | 'to' | 'q'>;

export interface WomenLessonsRange {
  from: string;
  to: string;
}
