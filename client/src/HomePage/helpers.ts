import type { HomeResponse, LessonOccurrence } from '@torabarabim/common';

import { RAIL_CONTEXT_LINE } from './consts';
import type { DateFilterOption, HomeMode, SelectedCity } from './models';

const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';
const SATURDAY = 6;

// en-CA formats as YYYY-MM-DD. An explicit IANA zone stays correct across
// Israel's DST transitions, unlike `new Date().toISOString()`.
const israelDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: ISRAEL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const todayInIsrael = (): string => israelDateFormatter.format(new Date());

// Done in UTC, never the browser's own timezone, since this only ever adds
// whole days to a date-only string, never a clock time.
export const addDays = (isoDate: string, days: number): string => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const weekdayOf = (isoDate: string): number => new Date(`${isoDate}T00:00:00Z`).getUTCDay();

const nextSaturday = (isoDate: string): string => {
  const daysUntilSaturday = (SATURDAY - weekdayOf(isoDate) + 7) % 7;
  return addDays(isoDate, daysUntilSaturday);
};

export const isDateFilterOption = (value: string | null): value is Exclude<DateFilterOption, 'custom' | 'all'> =>
  value === 'today' || value === 'tomorrow' || value === 'shabbat';

// The one place a chip resolves to an actual date (brief: "put the
// definition of each chip in exactly one place so that swapping to a
// server-resolved range later is one file").
export const resolveTargetDate = (option: DateFilterOption, customDate: string | undefined): string => {
  const today = todayInIsrael();

  if (option === 'custom') return customDate ?? today;
  if (option === 'tomorrow') return addDays(today, 1);
  if (option === 'shabbat') return nextSaturday(today);
  return today;
};

const longDateFormatter = new Intl.DateTimeFormat('he-IL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: ISRAEL_TIME_ZONE,
});

const compactDateFormatter = new Intl.DateTimeFormat('he-IL', {
  day: 'numeric',
  month: 'long',
  timeZone: ISRAEL_TIME_ZONE,
});

// היום / מחר / בשבת stand in for the date itself regardless of which
// formatter the caller otherwise wants, so both `dayLabel` and
// `compactDayLabel` resolve through this first.
const namedDayLabel = (isoDate: string): string | undefined => {
  const today = todayInIsrael();
  if (isoDate === today) return 'היום';
  if (isoDate === addDays(today, 1)) return 'מחר';
  if (weekdayOf(isoDate) === SATURDAY) return 'בשבת';
  return undefined;
};

// The heading word is a property of the date itself, not of which chip
// produced it.
export const dayLabel = (isoDate: string): string =>
  namedDayLabel(isoDate) ?? longDateFormatter.format(new Date(`${isoDate}T00:00:00Z`));

// Drops the weekday that `dayLabel` carries: the selected-date chip needs
// this to stay on one line with the other chips instead of wrapping below
// them (design review, item 8). The section heading keeps the full
// `dayLabel`, so the date still reads in full somewhere on the page.
export const compactDayLabel = (isoDate: string): string =>
  namedDayLabel(isoDate) ?? compactDateFormatter.format(new Date(`${isoDate}T00:00:00Z`));

// The one place the two page modes are decided: rail (nothing chosen, so
// render whatever the server sends) versus filtered (the existing single
// list). No in-between state.
export const resolveHomeMode = (option: DateFilterOption, city: SelectedCity | undefined, searchQuery: string): HomeMode =>
  option === 'all' && !city && !searchQuery ? 'rail' : 'filtered';

// Rail mode has no server-side rabbi or city list; RabbiRow and CityGrid
// are fed the union of every row's items instead of a single fetched list.
export const flattenHomeRows = (data: HomeResponse | undefined): LessonOccurrence[] | undefined =>
  data ? data.rows.flatMap((row) => row.items) : undefined;

// One element, two strings (brief: "not a rail-mode ornament") in rail mode.
// In filtered mode the section heading already names the day and, when one
// is chosen, the city (LessonsSection, dayHeadingLabel), so the context
// line there only earns its place when it carries something the heading
// does not: the search term. Otherwise it would just repeat the heading in
// a smaller size (design review, item 6).
export const contextLine = (mode: HomeMode, searchQuery: string): string | undefined => {
  if (mode === 'rail') return RAIL_CONTEXT_LINE;
  if (!searchQuery) return undefined;

  return `שיעורים לפי החיפוש "${searchQuery}"`;
};
