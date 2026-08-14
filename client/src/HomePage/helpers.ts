import type { DateFilterOption } from './models';

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

export const isDateFilterOption = (value: string | null): value is Exclude<DateFilterOption, 'custom'> =>
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

// The heading word is a property of the date itself, not of which chip
// produced it.
export const dayLabel = (isoDate: string): string => {
  const today = todayInIsrael();
  if (isoDate === today) return 'היום';
  if (isoDate === addDays(today, 1)) return 'מחר';
  if (weekdayOf(isoDate) === SATURDAY) return 'בשבת';
  return longDateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
};
