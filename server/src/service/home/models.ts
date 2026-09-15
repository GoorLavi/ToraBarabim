import type { CityWithLessonCount, HomeRowId, LessonAudience, LessonTopic, Place, Rabbi } from '@torabarabim/common';

import type { rabbis } from '../../db/schema';
import type { PlaceCityRow } from '../shared/place';

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
  place: Place;
  substituteRabbi?: Rabbi;
  note?: string;
  rabbiProminenceRank: number;
  shuffleKey: number;
}

// A row's item is either a lesson occurrence or the women's-area tile,
// server-placed at index 1 of the first row; see `getHome`.
export type HomeRowItemResult = { kind: 'lesson'; occurrence: ResolvedHomeOccurrence } | { kind: 'womensArea' };

export interface HomeRowResult {
  id: HomeRowId;
  title: string;
  items: HomeRowItemResult[];
}

export interface HomeResult {
  rows: HomeRowResult[];
  womensAreaLessonCount: number;
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

type RabbiRow = typeof rabbis.$inferSelect;

// Shared by `getHome` and `getWomenArea`, both of which use the same
// 14-day window.
export interface LoadedWindow {
  from: string;
  resolved: ResolvedHomeOccurrence[];
  cityByCode: Map<number, PlaceCityRow>;
  rabbiRows: RabbiRow[];
}
