import type { AdminDedication, Lesson, Rabbi, Weekday } from '@torabarabim/common';

import { rabbiDisplayName } from '~/helpers';

import { AdminApiError } from './api';
import * as consts from './consts';

// Used to prefill a new account's username field from the account's full
// name (e.g. "Yogev Malka" -> "yogevmalka"). The admin can still edit the
// result before submitting.
export const suggestUsername = (name: string): string => name.toLowerCase().replace(/\s+/g, '');

// An update omits a key to mean "leave as is" and sends `null` to mean
// "clear" (`common/src/admin.ts`), which an empty string alone cannot tell
// apart, so this also needs the value as it was loaded from the server. A
// field that was always blank and still is has nothing to clear, so it
// stays omitted rather than sending a needless `null`. Shared by every
// panel form with an optional, clearable text field (a rabbi's title and
// bio, a place's floor).
export const nullableTextField = (currentValue: string, existingValue: string | undefined): string | null | undefined => {
  const trimmed = currentValue.trim();
  if (trimmed) return trimmed;
  return existingValue === undefined ? undefined : null;
};

const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png'];

// A basic type/size check before upload, not a substitute for the server's
// own validation: nothing enforces a photo's actual dimensions here. That is
// right for the only caller left, the rabbi's 3:4 portrait, which the server
// does not size-check either and which the card crops on display. A place's
// photo goes through `PhotoPicker`'s crop step instead, which measures the
// source before it opens.
export const validatePhotoFile = (file: File): string | undefined => {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) return consts.UNSUPPORTED_TYPE_CLIENT_ERROR;
  if (file.size > consts.CLIENT_MAX_PHOTO_BYTES) return consts.TOO_LARGE_CLIENT_ERROR;
  return undefined;
};

// Status-aware, with per-call overrides keyed by the server's `error` code
// first and its HTTP status second, so a caller can surface e.g.
// 'unknown_rabbi' against a specific field while everything else falls
// back to generic, calm Hebrew copy. Never renders the raw server message.
export const adminErrorMessage = (error: unknown, overrides: Partial<Record<string | number, string>> = {}): string => {
  if (!(error instanceof AdminApiError)) return consts.GENERIC_ERROR_MESSAGE;

  const byCode = error.code ? overrides[error.code] : undefined;
  if (byCode !== undefined) return byCode;

  if (error.code === 'invalid_photo') return consts.INVALID_PHOTO_MESSAGE;

  const byStatus = overrides[error.status];
  if (byStatus !== undefined) return byStatus;

  if (error.status === 0) return consts.NETWORK_ERROR_MESSAGE;
  if (error.status === 401) return consts.UNAUTHENTICATED_MESSAGE;
  if (error.status === 429) return consts.RATE_LIMITED_MESSAGE;
  if (error.status === 404) return consts.NOT_FOUND_MESSAGE;
  if (error.status === 400) return consts.INVALID_REQUEST_MESSAGE;
  return consts.GENERIC_ERROR_MESSAGE;
};

const israeliDateFormatter = new Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Jerusalem' });

export const formatIsraeliDate = (isoDate: string): string => israeliDateFormatter.format(new Date(`${isoDate}T00:00:00Z`));

// Shared by `DedicationCard` and `DedicationViewPage`, the nearest common
// ancestor both sit under.
export const dedicationWindowLabel = (dedication: Pick<AdminDedication, 'startsOn' | 'endsOn'>): string =>
  `${formatIsraeliDate(dedication.startsOn)} עד ${formatIsraeliDate(dedication.endsOn)}`;

// `Date#getUTCDay` is specified to always return 0-6, so this narrowing
// from `number` to the `Weekday` literal union is safe by construction.
// The one place this narrowing is written; `LessonViewPage/helpers.ts` and
// `LessonFormPage/helpers.ts` both import it rather than repeating it.
export const asWeekday = (day: number): Weekday => day as Weekday;

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
export const recurrenceWhenLabel = (lesson: Pick<Lesson, 'recurrence'>): string => {
  if (lesson.recurrence.kind === 'weekly') return weeklyRecurrenceLabel(lesson.recurrence.weekdays);
  const weekday = asWeekday(new Date(`${lesson.recurrence.date}T00:00:00Z`).getUTCDay());
  return `${consts.WEEKDAY_LABELS[weekday]}, ${formatIsraeliDate(lesson.recurrence.date)}`;
};

// Matches the public `LessonCard`'s rule: the lesson's own title leads, and
// the rabbi's composed display name is what fills in when there is none.
// Takes the lesson and its rabbi separately, rather than a joined row type
// owned by one caller, since `LessonsListPage` and `RabbiViewPage` (the
// two callers) each join a lesson to its rabbi differently.
export const lessonPrimaryLabel = (lesson: Pick<Lesson, 'title'>, rabbi: Pick<Rabbi, 'name' | 'honorific'> | undefined): string =>
  lesson.title ?? (rabbi ? rabbiDisplayName(rabbi) : consts.UNTITLED_RABBI_FALLBACK);
export const lessonHasOwnTitle = (lesson: Pick<Lesson, 'title'>): boolean => Boolean(lesson.title);
