import type { LessonOccurrence } from './lesson-occurrence';

// A rabbi's prominence tier drives sort order within a home row only; it
// never appears on `Rabbi` or on any occurrence the client receives.
export type RabbiProminence = 'local' | 'known' | 'sought';

export type HomeRowId = 'area' | 'today' | 'bothAudiences' | 'weekly';

export interface HomeRow {
  id: HomeRowId;
  title: string;
  items: LessonOccurrence[];
  // The 0-based index within `items` where the women's-area tile renders;
  // present only on the one row that carries it (0012: the client renders
  // `items` exactly as given and never reorders them, so it splices the
  // tile in at this index rather than choosing where it goes).
  womensAreaTileIndex?: number;
}

export interface HomeResponse {
  rows: HomeRow[];
  // The count behind the women's-area band and tile; equal to
  // `WomenAreaResponse`'s `lessonCount` when populated, since both are built
  // from the same women's-set step.
  womensAreaLessonCount: number;
}
