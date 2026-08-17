import type { Lesson, LessonListResponse, Place, RabbiListResponse, Weekday } from '@torabarabim/common';

import * as consts from './consts';
import type { AdminLessonRow, RecurrenceFilter } from './models';

export const joinLessonRows = (
  lessons: LessonListResponse['items'],
  rabbis: RabbiListResponse['items'],
  places: Place[],
): AdminLessonRow[] => {
  const rabbiMap = new Map(rabbis.map((rabbi) => [rabbi.id, rabbi]));
  const placeMap = new Map(places.map((place) => [place.id, place]));
  return lessons.map((lesson) => ({ lesson, rabbi: rabbiMap.get(lesson.rabbiId), place: placeMap.get(lesson.placeId) }));
};

const israeliDateFormatter = new Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Jerusalem' });

export const formatIsraeliDate = (isoDate: string): string => israeliDateFormatter.format(new Date(`${isoDate}T00:00:00Z`));

// `Date#getUTCDay` is specified to always return 0-6, so this narrowing
// from `number` to the `Weekday` literal union is safe by construction.
const asWeekday = (day: number): Weekday => day as Weekday;

// Groups sorted, de-duplicated weekdays into runs of consecutive days, so
// `weeklyRecurrenceLabel` can collapse a run into a range instead of
// spelling out every day.
const weekdayRuns = (weekdays: Weekday[]): Weekday[][] => {
  const sorted = [...new Set(weekdays)].sort((a, b) => a - b);
  const runs: Weekday[][] = [];
  for (const day of sorted) {
    const lastRun = runs[runs.length - 1];
    const lastDayInRun = lastRun?.[lastRun.length - 1];
    if (lastDayInRun !== undefined && day === lastDayInRun + 1) lastRun?.push(day);
    else runs.push([day]);
  }
  return runs;
};

const joinWithConjunction = (items: string[]): string => {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ו${items[items.length - 1]}`;
};

// A run built by `weekdayRuns` is never empty; this reads its edges
// without `noUncheckedIndexedAccess` losing track of that.
const runRangeLabel = (run: Weekday[]): string | undefined => {
  const [firstDay] = run;
  const lastDay = run[run.length - 1];
  if (firstDay === undefined || lastDay === undefined) return undefined;
  return `${consts.WEEKDAY_BARE_LABELS[firstDay]} עד ${consts.WEEKDAY_BARE_LABELS[lastDay]}`;
};

// A recurring lesson's weekdays collapsed onto one line: a single day
// stays `כל יום שני`, a run of three or more consecutive days becomes a
// range (`כל יום, ראשון עד חמישי`), and any other combination is a
// comma-and-conjunction list (`כל ראשון, שלישי וחמישי`). A long list of
// full weekday names joined with `/` used to wrap to several lines on
// both the card and the table row it sits in.
export const weeklyRecurrenceLabel = (weekdays: Weekday[]): string => {
  const [onlyDay] = weekdays;
  if (weekdays.length === 1 && onlyDay !== undefined) return `כל ${consts.WEEKDAY_LABELS[onlyDay]}`;

  const runs = weekdayRuns(weekdays);
  const [onlyRun] = runs;
  if (runs.length === 1 && onlyRun && onlyRun.length >= 3) {
    const rangeLabel = runRangeLabel(onlyRun);
    if (rangeLabel) return `כל יום, ${rangeLabel}`;
  }

  const segments = runs.flatMap((run) => {
    if (run.length >= 3) {
      const rangeLabel = runRangeLabel(run);
      return rangeLabel ? [rangeLabel] : [];
    }
    return run.map((day) => consts.WEEKDAY_BARE_LABELS[day]);
  });
  return `כל ${joinWithConjunction(segments)}`;
};

// A lesson's rendered "when" line: weekday name(s) for a recurring lesson,
// or the weekday plus the calendar date for a one-time one, matching the
// brief's `כל יום שלישי` / `יום שלישי, 16.12.2025` examples.
export const recurrenceWhenLabel = (lesson: Lesson): string => {
  if (lesson.recurrence.kind === 'weekly') return weeklyRecurrenceLabel(lesson.recurrence.weekdays);
  const weekday = asWeekday(new Date(`${lesson.recurrence.date}T00:00:00Z`).getUTCDay());
  return `${consts.WEEKDAY_LABELS[weekday]}, ${formatIsraeliDate(lesson.recurrence.date)}`;
};

// Ranks a lesson by how soon its next occurrence is, counting today as 0.
// A one-time lesson whose date has already passed sorts last: it is not
// "coming up" for anyone reading this list.
export const soonestOffsetDays = (lesson: Lesson, today: Date): number => {
  if (lesson.recurrence.kind === 'once') {
    const date = new Date(`${lesson.recurrence.date}T00:00:00Z`);
    const diff = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : Number.MAX_SAFE_INTEGER;
  }
  const todayWeekday = today.getUTCDay();
  const offsets = lesson.recurrence.weekdays.map((weekday) => (weekday - todayWeekday + 7) % 7);
  return Math.min(...offsets);
};

export const sortRowsBySoonest = (rows: AdminLessonRow[]): AdminLessonRow[] => {
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
  return [...rows].sort((a, b) => soonestOffsetDays(a.lesson, today) - soonestOffsetDays(b.lesson, today));
};

const rowMatchesRecurrence = (row: AdminLessonRow, filter: RecurrenceFilter): boolean => {
  if (filter === 'all') return true;
  return row.lesson.recurrence.kind === filter;
};

const rowMatchesSearch = (row: AdminLessonRow, search: string): boolean => {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  const haystack = [row.lesson.title, row.rabbi?.name, row.place?.name, row.place?.city].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(query);
};

// The server's `GET /v1/admin/lessons` has no text-search or recurrence
// filter param today (see this slice's report), so both are applied here,
// client-side, over whatever page is already loaded.
export const filterRows = (rows: AdminLessonRow[], recurrence: RecurrenceFilter, search: string): AdminLessonRow[] =>
  rows.filter((row) => rowMatchesRecurrence(row, recurrence) && rowMatchesSearch(row, search));

// Matches the public `LessonCard`'s rule: the lesson's own title leads, and
// the rabbi's name is what fills in when there is none.
export const lessonPrimaryLabel = (row: AdminLessonRow): string => row.lesson.title ?? row.rabbi?.name ?? consts.UNTITLED_RABBI_FALLBACK;
export const lessonHasOwnTitle = (row: AdminLessonRow): boolean => Boolean(row.lesson.title);
