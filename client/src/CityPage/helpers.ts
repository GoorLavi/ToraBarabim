import type { LessonOccurrence } from '@torabarabim/common';

import type { CityPageApiError } from './api';
import * as consts from './consts';

export type CityErrorCopy =
  | { kind: 'not-found'; heading: string; body: string }
  | { kind: 'error'; heading: string; body: string };

// A 404 is a fact about the name, so its screen offers a way out. Every
// other failure is transient, so its screen offers a retry (mirrors
// RabbiPage/helpers.ts, rabbiErrorCopy).
export const cityErrorCopy = (error: CityPageApiError | null): CityErrorCopy => {
  if (error?.status === 404) {
    return { kind: 'not-found', heading: consts.NOT_FOUND_HEADING, body: consts.NOT_FOUND_BODY };
  }
  return { kind: 'error', heading: consts.ERROR_HEADING, body: consts.ERROR_BODY };
};

export interface DayGroup {
  date: string;
  items: LessonOccurrence[];
}

// A city page groups by day because, once someone has chosen where, the
// only question left is when (design spec, guidance intent). Sorted
// defensively rather than trusted blind, the same choice
// RabbiPage/helpers.ts makes for its own row list.
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
