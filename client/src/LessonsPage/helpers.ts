import type { AppliedLessonFilters, Area, LessonOccurrence } from '@torabarabim/common';

import { LESSON_WINDOW_DAYS, LESSON_WINDOW_PAGE_SIZE } from '~/HomePage/consts';
import { addDays, compactDayLabel, resolveTargetDate, todayInIsrael } from '~/HomePage/helpers';
import { rabbiDisplayName } from '~/helpers';
import type { DateFilterOption, SelectedCity } from '~/hooks/models';

import {
  COMPLETE_LIST_RANGE_DAYS,
  INVALID_REQUEST_HINT,
  LESSONS_PAGE_AREA_NAMES,
  NETWORK_ERROR_HINT,
  PAGE_SIZE,
  SERVER_ERROR_HINT,
  TITLE_UNFILTERED,
} from './consts';
import type { LessonsApiError } from './api';
import type { PassThroughFilters } from './models';

const isArea = (value: string): value is Area => value in LESSONS_PAGE_AREA_NAMES;

export interface ResolvedRange {
  from: string;
  to: string;
  pageSize: number;
  // Whether a date chip (or the calendar) narrows the request to one day
  // plus the widen window, as opposed to the complete, paginated list.
  hasDateFilter: boolean;
}

// The one place the two page modes resolve to a date range: the complete
// list (bounded by the server's own maximum range) with no date filter, or
// a single target day plus HomePage's existing widen window when one is
// set (05-lessons.md, "Data").
export const resolveLessonsRange = (option: DateFilterOption, customDate: string | undefined): ResolvedRange => {
  const today = todayInIsrael();

  if (option === 'all') {
    return { from: today, to: addDays(today, COMPLETE_LIST_RANGE_DAYS), pageSize: PAGE_SIZE, hasDateFilter: false };
  }

  const from = resolveTargetDate(option, customDate);
  return { from, to: addDays(from, LESSON_WINDOW_DAYS), pageSize: LESSON_WINDOW_PAGE_SIZE, hasDateFilter: true };
};

export const hasPassThroughFilter = (passThrough: PassThroughFilters): boolean =>
  Boolean(passThrough.rabbiId || passThrough.area || passThrough.topic || passThrough.audience || passThrough.placeId);

// `rabbiId`, `area` and `placeId` are the three pass-through filters the
// title names (below); `topic` and `audience` stay silently unnamed, as
// before. Used to pick the dedicated empty-state heading these three need
// when the fetch comes back with nothing to read a display name off of.
export const hasNamedPassThroughFilter = (passThrough: PassThroughFilters): boolean =>
  Boolean(passThrough.rabbiId || passThrough.area || passThrough.placeId);

// The ratified empty state (design-system.md, "Every data screen has three
// states"): when the target day has nothing, this widens forward to the
// next day within the fetched window that has any lessons. `items` is
// expected pre-sorted by date, which GET /v1/lessons already guarantees.
export const selectDaySections = (
  items: LessonOccurrence[],
  targetDate: string,
): { primaryItems: LessonOccurrence[]; fallbackDate: string | undefined; fallbackItems: LessonOccurrence[] } => {
  const primaryItems = items.filter((item) => item.date === targetDate);
  if (primaryItems.length > 0) {
    return { primaryItems, fallbackDate: undefined, fallbackItems: [] };
  }

  const fallbackDate = items.find((item) => item.date > targetDate)?.date;
  const fallbackItems = fallbackDate ? items.filter((item) => item.date === fallbackDate) : [];
  return { primaryItems: [], fallbackDate, fallbackItems };
};

// היום / מחר / בשבת stand on their own; any other date takes a ב prefix
// with a maqaf (05-lessons.md: "היום / מחר / בשבת / ב־<date>"). Without the
// maqaf "ב16 בספטמבר" reads as the digit "16" glued onto the letter ב
// rather than the prefix "on the 16th".
export const dateWord = (targetDate: string): string => {
  const label = compactDayLabel(targetDate);
  if (label === 'היום' || label === 'מחר' || label === 'בשבת') return label;
  return `ב־${label}`;
};

// The one place the page's h1 is built: שיעורים, plus של/ב.../באזור... for
// whichever pass-through filter is active, plus ב<city> when a city is set,
// plus the date word when a date is set, plus the search term when one is
// set. With nothing set at all it is the fixed TITLE_UNFILTERED (05-lessons.md:
// "Rule [D]").
//
// `rabbiId` and `placeId` name a specific record with no client-known
// display name, so each reads it off the search response's own
// `appliedFilters` (common/src/lesson-occurrence.ts): the server already
// resolved the id to filter on it, so the name is there even when `items`
// comes back empty, unlike reading it off a first result, which works only
// when there is one. `area` is the one pass-through filter whose value is
// already a known code synchronously (the URL param itself), so it resolves
// through `LESSONS_PAGE_AREA_NAMES` instead and never depends on the
// response at all.
export const buildLessonsTitle = (
  city: SelectedCity | undefined,
  option: DateFilterOption,
  customDate: string | undefined,
  query: string,
  passThrough: PassThroughFilters,
  appliedFilters: AppliedLessonFilters,
): string => {
  const hasNamed = hasNamedPassThroughFilter(passThrough);
  if (!city && option === 'all' && !query && !hasNamed) return TITLE_UNFILTERED;

  let title = 'שיעורים';
  if (appliedFilters.rabbi) title += ` של ${rabbiDisplayName(appliedFilters.rabbi)}`;
  // `של`, never a prefixed `ב`: a place name is free text, so `בישיבת…`
  // reads as a grammar error and `במשפחת כהן` as "inside the Cohen family".
  // A free-standing `של` attaches to nothing and survives every name shape.
  if (appliedFilters.place) title += ` של ${appliedFilters.place.name}`;
  if (passThrough.area && isArea(passThrough.area)) title += ` באזור ${LESSONS_PAGE_AREA_NAMES[passThrough.area]}`;
  if (city) title += ` ב${city.name}`;
  if (option !== 'all') title += ` ${dateWord(resolveTargetDate(option, customDate))}`;
  if (query) title += ` לפי החיפוש ״${query}״`;
  return title;
};

export const lessonCountLabel = (count: number): string => (count === 1 ? 'שיעור אחד' : `${count} שיעורים`);

const where = (cityName: string | undefined): string => (cityName ? ` ב${cityName}` : '');

export const noLessonsHeadline = (cityName: string | undefined, dayWord: string): string => `אין שיעורים${where(cityName)} ${dayWord}`;

export const noLessonsWidenedHint = (cityName: string | undefined): string =>
  `הנה המועד הקרוב ביותר${where(cityName)} שיש בו שיעורים.`;

export const noLessonsNoFallbackBody = (cityName: string | undefined): string => `גם בימים הקרובים אין שיעורים${where(cityName)}.`;

export const noFilteredLessonsHeadline = (cityName: string | undefined, query: string): string => {
  const queryPart = query ? ` לפי החיפוש ״${query}״` : '';
  return `לא נמצאו שיעורים${where(cityName)}${queryPart}`;
};

// The dedicated empty-state heading for a link in from a rabbi, area or
// place page (a named pass-through filter) whose fetch came back with zero
// results. The rabbi and area cases are word-for-word what RabbiPage's and
// AreaPage's own empty headings say (RabbiPage/consts.ts, noLessonsHeading;
// AreaPage/consts.ts, noLessonsHeading). `rabbi` and `place` come from the
// search response's own `appliedFilters`, which the server sets whenever the
// id it was sent resolved to a real record, whether or not any lesson
// matched it, so a real rabbi or place with no lessons still gets named
// here; only an id that named nothing real falls through to the unnamed
// heading, the same as `area` does when its code fails to resolve. Still
// appends the city and query suffixes: a named filter combined with a city
// or a search term is still a real constraint the heading must not omit.
export const passThroughEmptyHeadline = (
  passThrough: PassThroughFilters,
  appliedFilters: AppliedLessonFilters,
  cityName: string | undefined,
  query: string,
): string => {
  let headline = 'לא נמצאו שיעורים';
  if (appliedFilters.rabbi) headline = `אין כרגע שיעורים של ${rabbiDisplayName(appliedFilters.rabbi)}`;
  else if (appliedFilters.place) headline = `אין כרגע שיעורים של ${appliedFilters.place.name}`;
  else if (passThrough.area && isArea(passThrough.area)) headline = `אין כרגע שיעורים באזור ${LESSONS_PAGE_AREA_NAMES[passThrough.area]}`;

  const queryPart = query ? ` לפי החיפוש ״${query}״` : '';
  return `${headline}${where(cityName)}${queryPart}`;
};

// Status-aware, never the raw message (client/CLAUDE.md, "Map an API error
// to Hebrew user copy through one status-aware helper").
export const getErrorHint = (error: LessonsApiError | null): string => {
  if (!error) return SERVER_ERROR_HINT;
  if (error.status === 0) return NETWORK_ERROR_HINT;
  if (error.status === 400) return INVALID_REQUEST_HINT;
  return SERVER_ERROR_HINT;
};
