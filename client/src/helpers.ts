import type { AreaSummary, City, LessonOccurrence, Rabbi } from '@torabarabim/common';

import type { DayGroup } from './models';

// `dir="auto"` resolves direction from the value's first strong directional
// character. A value without one, whether empty or only whitespace, falls
// back to `ltr` in Chrome, which puts a Hebrew placeholder and the caret on
// the wrong side of a field the user reads as blank. Forcing `rtl` until
// there is real content, then handing back to `auto`, keeps a genuinely
// Latin value (a Latin place name) rendering LTR.
export const directionForValue = (value: string): 'rtl' | 'auto' => (value.trim() ? 'auto' : 'rtl');

// The one place a rabbi's public path is built, from the id React Router
// matches on and the slug that decorates it for a reader and for search
// results. Hebrew is not ASCII on the wire, so both segments are
// percent-encoded here; a caller never encodes either a second time. `Rabbi`
// (common/src/rabbi.ts) guarantees `slug` is never empty, so there is no
// bare-id fallback to fall back to.
export const rabbiPath = (rabbi: Pick<Rabbi, 'id' | 'slug'>): string =>
  `/rabbis/${encodeURIComponent(rabbi.id)}/${encodeURIComponent(rabbi.slug)}`;

// The one place a city's public path is built. The slug travels on the
// wire (`City.slug`), so this never calls the server's `toSlug` a second
// time in the browser.
export const cityPath = (city: Pick<City, 'slug'>): string => `/cities/${encodeURIComponent(city.slug)}`;

// The one place an area's public path is built, mirroring cityPath.
export const areaPath = (area: Pick<AreaSummary, 'slug'>): string => `/areas/${encodeURIComponent(area.slug)}`;

// Shared by the city page, the cities directory and the area page: once
// someone has chosen where, the only question left is when (design spec,
// guidance intent). Sorted defensively rather than trusted blind.
export const groupByDay = (items: LessonOccurrence[]): DayGroup[] => {
  const sorted = [...items].sort((a, b) =>
    a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date),
  );

  const groups: DayGroup[] = [];
  for (const item of sorted) {
    const lastGroup = groups.at(-1);
    if (lastGroup && lastGroup.date === item.date) {
      lastGroup.items.push(item);
    } else {
      groups.push({ date: item.date, items: [item] });
    }
  }
  return groups;
};

const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';
const SATURDAY = 6;

const israelDateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: ISRAEL_TIME_ZONE });
const longWeekdayFormatter = new Intl.DateTimeFormat('he-IL', { weekday: 'long', timeZone: ISRAEL_TIME_ZONE });
const dayMonthFormatter = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', timeZone: ISRAEL_TIME_ZONE });

const todayInIsrael = (): string => israelDateFormatter.format(new Date());

const addOneDay = (isoDate: string): string => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
};

// Today and tomorrow name the weekday instead of the date, since the date
// itself is redundant once "today" already says which day it is; every
// other day, including Saturday, names the date (design spec, "Day
// heading"). Saturday drops the weekday word entirely ("שבת", never "יום
// שבת"), which is also the literal output of a "long" weekday format for
// day 6 in he-IL, so no separate branch is needed for it, only for the
// named-day cases that skip the calendar date altogether.
export const dayGroupHeading = (isoDate: string): string => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const today = todayInIsrael();

  if (isoDate === today) return `היום, ${longWeekdayFormatter.format(date)}`;
  if (isoDate === addOneDay(today)) return `מחר, ${longWeekdayFormatter.format(date)}`;
  if (date.getUTCDay() === SATURDAY) return `שבת, ${dayMonthFormatter.format(date)}`;
  return `${longWeekdayFormatter.format(date)}, ${dayMonthFormatter.format(date)}`;
};
