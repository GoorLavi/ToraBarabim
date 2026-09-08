import type { LessonOccurrence } from '@torabarabim/common';

import { LESSON_WINDOW_DAYS, LESSON_WINDOW_PAGE_SIZE } from '~/HomePage/consts';
import { addDays, compactDayLabel, resolveTargetDate, todayInIsrael } from '~/HomePage/helpers';
import type { DateFilterOption, SelectedCity } from '~/hooks/models';

import { COMPLETE_LIST_RANGE_DAYS, INVALID_REQUEST_HINT, NETWORK_ERROR_HINT, PAGE_SIZE, SERVER_ERROR_HINT, TITLE_UNFILTERED } from './consts';
import type { LessonsApiError } from './api';
import type { PassThroughFilters } from './models';

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
  Boolean(passThrough.rabbiId || passThrough.area || passThrough.topic || passThrough.audience);

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
// (05-lessons.md: "היום / מחר / בשבת / ב<date>").
export const dateWord = (targetDate: string): string => {
  const label = compactDayLabel(targetDate);
  if (label === 'היום' || label === 'מחר' || label === 'בשבת') return label;
  return `ב${label}`;
};

// The one place the page's h1 is built: שיעורים, plus ב<city> when a city
// is set, plus the date word when a date is set, plus the search term when
// one is set. With nothing set at all it is the fixed TITLE_UNFILTERED
// (05-lessons.md: "Rule [D]").
export const buildLessonsTitle = (
  city: SelectedCity | undefined,
  option: DateFilterOption,
  customDate: string | undefined,
  query: string,
): string => {
  if (!city && option === 'all' && !query) return TITLE_UNFILTERED;

  let title = 'שיעורים';
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

// Status-aware, never the raw message (client/CLAUDE.md, "Map an API error
// to Hebrew user copy through one status-aware helper").
export const getErrorHint = (error: LessonsApiError | null): string => {
  if (!error) return SERVER_ERROR_HINT;
  if (error.status === 0) return NETWORK_ERROR_HINT;
  if (error.status === 400) return INVALID_REQUEST_HINT;
  return SERVER_ERROR_HINT;
};
