import type { CourseSummary } from './course';
import type { DedicationGroup } from './dedication';
import type { LessonOccurrence } from './lesson-occurrence';
import type { Rabbi } from './rabbi';

// A rabbi's prominence tier drives sort order within a home row and across
// the "לפי רב" avatar row and the public rabbi directory; it never appears
// on `Rabbi` or on any occurrence the client receives.
export type RabbiProminence = 'local' | 'known' | 'sought';

export type HomeLessonRowId = 'area' | 'today' | 'bothAudiences' | 'weekly';

// A union on `kind`, exactly 0012's shape: the client renders `rows` in the
// order given and decides nothing about placement. The one `kind: 'courses'`
// row (at most one) is where the server chose to put it, never a row the
// client assembles or reorders.
export type HomeRow =
  | {
      kind: 'lessons';
      id: HomeLessonRowId;
      title: string;
      items: LessonOccurrence[];
      // The 0-based index within `items` where the women's-area tile
      // renders; present only on the one row that carries it (0012: the
      // client renders `items` exactly as given and never reorders them, so
      // it splices the tile in at this index rather than choosing where it
      // goes). Never set on a `kind: 'courses'` row: the tile only ever
      // lands inside a lesson row.
      womensAreaTileIndex?: number;
    }
  | { kind: 'courses'; id: 'courses'; title: string; items: CourseSummary[] };

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
  // A sibling of `rows`, never an entry inside one: 0012 has the client
  // render `rows` exactly as given, never filtering, sorting or
  // special-casing an item, so a dedication (not a lesson) must not be
  // smuggled into a row's `items`
  // (docs/decisions/0012-the-home-page-is-composed-by-the-server.md).
  dedications: DedicationGroup[];
}
