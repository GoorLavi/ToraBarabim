import type { LessonOccurrence } from './lesson-occurrence';

// A rabbi's prominence tier drives sort order within a home row only; it
// never appears on `Rabbi` or on any occurrence the client receives.
export type RabbiProminence = 'local' | 'known' | 'sought';

export type HomeRowId = 'area' | 'today' | 'bothAudiences' | 'weekly';

// A row is mostly lesson occurrences, but the first row carries one
// non-lesson item, the women's-area tile: server-placed, per 0012's rule
// that the client renders whichever kind it receives, in order, and decides
// nothing about the rows.
export type HomeRowItem = { kind: 'lesson'; lesson: LessonOccurrence } | { kind: 'womensArea' };

export interface HomeRow {
  id: HomeRowId;
  title: string;
  items: HomeRowItem[];
}

export interface HomeResponse {
  rows: HomeRow[];
  // The count behind the women's-area band and tile; equal to
  // `WomenAreaResponse`'s `lessonCount` when populated, since both are built
  // from the same women's-set step.
  womensAreaLessonCount: number;
}
