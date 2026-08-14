import type { Weekday } from '@torabarabim/common';

const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';

// en-CA formats as YYYY-MM-DD. Intl with an explicit IANA zone stays
// correct across Israel's DST transitions, unlike `new Date().toISOString()`.
const israelDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: ISRAEL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const todayInIsrael = (now: Date): string => israelDateFormatter.format(now);

// Done in UTC, never the host machine's own timezone, since we only ever
// add whole days to a date-only string, never a clock time.
export const addDays = (isoDate: string, days: number): string => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const daysBetween = (fromIsoDate: string, toIsoDate: string): number => {
  const from = new Date(`${fromIsoDate}T00:00:00Z`);
  const to = new Date(`${toIsoDate}T00:00:00Z`);
  return Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
};

export const weekdayOf = (isoDate: string): Weekday => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return date.getUTCDay() as Weekday;
};

export const compareIsoDates = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

// Includes `today` itself if it already falls on `weekday`.
export const nextDateOnWeekday = (today: string, weekday: Weekday): string => {
  let cursor = today;
  for (let i = 0; i < 7; i += 1) {
    if (weekdayOf(cursor) === weekday) return cursor;
    cursor = addDays(cursor, 1);
  }
  return today;
};
