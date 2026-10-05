import type { CityWithLessonCount, HelpTileKind, HomeLessonRowId, LessonAudience, LessonTopic, LessonVenue, Rabbi } from '@torabarabim/common';

import type { rabbis } from '../../db/schema';
import type { AddressCityRow } from '../shared/address';
import type { CourseSummaryRecord } from '../course/models';
import type { DedicationGroupResult } from '../dedication/models';

// Kept distinct from the wire `LessonOccurrence`: it carries the sort-only
// `rabbiProminenceRank` and `shuffleKey`, and the raw `cityCode` the
// women's-set step and the city grid group by, none of which the convertor
// may let reach the client.
export interface ResolvedHomeOccurrence {
  lessonId: string;
  date: string;
  startTime: string;
  endTime: string;
  title?: string;
  topic?: LessonTopic;
  audience: LessonAudience;
  recurrenceKind: 'weekly' | 'once';
  rabbi: Rabbi;
  cityCode: number;
  venue: LessonVenue;
  substituteRabbi?: Rabbi;
  note?: string;
  rabbiProminenceRank: number;
  shuffleKey: number;
}

export interface LessonHomeRowResult {
  kind: 'lessons';
  id: HomeLessonRowId;
  title: string;
  items: ResolvedHomeOccurrence[];
  // The 0-based index in `items` where the women's-area tile renders; see
  // `placeWomensAreaTile`. Present on at most one row, and only ever a
  // lesson row: the tile never lands inside the course row.
  womensAreaTileIndex?: number;
  // The help tile and its 0-based slot in `items`; see `placeHelpTiles`.
  // Never set on a row that carries `womensAreaTileIndex`, and never on the
  // course row.
  helpTile?: { kind: HelpTileKind; index: number };
}

export interface CourseHomeRowResult {
  kind: 'courses';
  id: 'courses';
  title: string;
  items: CourseSummaryRecord[];
}

// A union on `kind`, exactly the wire `HomeRow`'s own shape (plain A):
// `getHome` places the one `kind: 'courses'` row itself, directly after the
// first lesson row, with no skew mitigation for an open tab during a
// deploy (the owner's call at the gate).
export type HomeRowResult = LessonHomeRowResult | CourseHomeRowResult;

export interface HomeResult {
  rows: HomeRowResult[];
  womensAreaLessonCount: number;
  // The "לפי רב" avatar row's rabbis, sorted and capped, as raw rows: the
  // convertor is what turns them into wire `Rabbi`s.
  rabbis: RabbiRow[];
  // The active dedication groups, drawn from `dedicationService.listActive`
  // in the same `Promise.all` as `loadWindow`. `toHomeResponse` reads these
  // off this result directly, so the response can never disagree with the
  // `HomeResult` it was built from.
  dedicationGroups: DedicationGroupResult[];
  // Already wire-shaped (`CityWithLessonCount` carries no internal column),
  // so the convertor passes it through.
  cities: CityWithLessonCount[];
}

// The three row families `interleaveRows` takes from, each already ranked.
export interface RowFamilies {
  fixed: LessonHomeRowResult[];
  areas: LessonHomeRowResult[];
  topics: LessonHomeRowResult[];
}

export type TimeBand = 'morning' | 'midday';

// What `buildWomensSet` returns: the women's lesson stats alone. `courses`
// is a separate load (`courseService.listForWomenArea`), not part of this
// set, since a course carries no lesson-recurrence window to resolve.
export interface WomensSet {
  lessonCount: number;
  teachers: Rabbi[];
  cities: CityWithLessonCount[];
}

// `GET /v1/women`'s summary, built from the same women's-set step `getHome`
// uses for its count and its tile, so the two numbers never drift apart.
// `courses` is the women's-scope course set, carried on both arms, since a
// course rail can show beside the lessons-empty state.
export type WomenAreaResult =
  | ({ kind: 'populated' } & WomensSet & { courses: CourseSummaryRecord[] })
  | { kind: 'empty'; rabbaniyot: Rabbi[]; courses: CourseSummaryRecord[] };

export type RabbiRow = typeof rabbis.$inferSelect;

// Shared by `getHome` and `getWomenArea`, both of which use the same
// 14-day window.
export interface LoadedWindow {
  from: string;
  resolved: ResolvedHomeOccurrence[];
  cityByCode: Map<number, AddressCityRow>;
  rabbiRows: RabbiRow[];
  // Every rabbi id with at least one lesson row, regardless of the window:
  // the same "has a lesson" the rabbi directory means when it decides
  // which rabbi to list first within a tier.
  rabbiIdsWithLessons: Set<string>;
}
