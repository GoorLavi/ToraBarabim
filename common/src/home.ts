import type { Area } from './area';
import type { CityWithLessonCount } from './city-directory';
import type { CourseSummary } from './course';
import type { DedicationGroup } from './dedication';
import type { LessonTopic } from './lesson';
import type { LessonOccurrence } from './lesson-occurrence';
import type { Rabbi } from './rabbi';
import type { VisitorMessageType } from './visitor-message';

// A rabbi's prominence tier drives sort order within a home row and across
// the "לפי רב" avatar row and the public rabbi directory; it never appears
// on `Rabbi` or on any occurrence the client receives.
export type RabbiProminence = 'local' | 'known' | 'sought';

// What a help tile asks of the visitor: a message of one of the two types,
// or a share of the site, which opens no window.
export type HelpTileKind = VisitorMessageType | 'share';

// `area:<area>` and `topic:<topic>` carry their axis in the id so every row id
// on a page is unique. `topic:other` is never sent: "other" is not a theme a
// visitor browses by.
export type HomeLessonRowId =
  | 'today'
  | 'bothAudiences'
  | 'weekly'
  | 'morning'
  | 'midday'
  | `area:${Area}`
  | `topic:${Exclude<LessonTopic, 'other'>}`;

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
      // The help tile this row carries and the 0-based index in `items`
      // where it renders (at least 2, and `items.length` means after the
      // last card). Chosen at random per request by the server; the client
      // splices it in as given and never randomises (0012, 0023). Never set
      // on a row that carries `womensAreaTileIndex`, and never on a
      // `kind: 'courses'` row.
      helpTile?: { kind: HelpTileKind; index: number };
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
  // The city grid: general scope, distinct lessons with at least one
  // scheduled occurrence in the home window, grouped by the lesson's own
  // city, sorted by count then name and capped server-side. Always an array;
  // empty means the client renders no grid.
  cities: CityWithLessonCount[];
}
