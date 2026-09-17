import type { LessonOccurrence } from './lesson-occurrence';
import type { Rabbi } from './rabbi';

// A rabbi's prominence tier drives sort order within a home row and across
// the "לפי רב" avatar row and the public rabbi directory; it never appears
// on `Rabbi` or on any occurrence the client receives.
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
  // The "לפי רב" avatar row's rabbis, already sorted and capped
  // server-side (see `rabbiService.list`'s ordering, shared by both
  // surfaces). Always present, always an array, so the client never
  // branches on it being missing. Excludes rabbaniyot, matching the rest of
  // this general-scope response.
  rabbis: Rabbi[];
}
