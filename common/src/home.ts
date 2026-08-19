import type { LessonOccurrence } from './lesson-occurrence';

// A rabbi's prominence tier drives sort order within a home row only; it
// never appears on `Rabbi` or on any occurrence the client receives.
export type RabbiProminence = 'local' | 'known' | 'sought';

export type HomeRowId = 'area' | 'today' | 'bothAudiences' | 'weekly';

export interface HomeRow {
  id: HomeRowId;
  title: string;
  items: LessonOccurrence[];
}

export interface HomeResponse {
  rows: HomeRow[];
}
