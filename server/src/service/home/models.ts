import type { CityWithLessonCount, HomeRowId, LessonAudience, LessonTopic, LessonVenue, Rabbi } from '@torabarabim/common';

import type { rabbis } from '../../db/schema';
import type { AddressCityRow } from '../shared/address';

// Kept distinct from the wire `LessonOccurrence`: it carries the sort-only
// `rabbiProminenceRank` and `shuffleKey`, and the raw `cityCode` the
// women's-set step needs to dedupe cities, none of which the convertor may
// let reach the client.
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

export interface HomeRowResult {
  id: HomeRowId;
  title: string;
  items: ResolvedHomeOccurrence[];
  // The 0-based index in `items` where the women's-area tile renders; see
  // `getHome`'s placement cadence. Present on at most one row.
  womensAreaTileIndex?: number;
}

export interface HomeResult {
  rows: HomeRowResult[];
  womensAreaLessonCount: number;
  // The "לפי רב" avatar row's rabbis, sorted and capped, as raw rows: the
  // convertor is what turns them into wire `Rabbi`s.
  rabbis: RabbiRow[];
}

// `GET /v1/women`'s summary, built from the same women's-set step `getHome`
// uses for its count and its tile, so the two numbers never drift apart.
export type WomenAreaResult =
  | { kind: 'populated'; lessonCount: number; teachers: Rabbi[]; cities: CityWithLessonCount[] }
  | { kind: 'empty'; rabbaniyot: Rabbi[] };

// What `buildWomensSet` returns: the populated branch of `WomenAreaResult`,
// without its discriminant, since the caller decides `kind` from the
// lesson count.
export type WomensSet = Omit<Extract<WomenAreaResult, { kind: 'populated' }>, 'kind'>;

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
