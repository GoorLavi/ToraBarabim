import type { LessonOccurrence, RabbiLessonResponse } from '@torabarabim/common';

import * as consts from './consts';
import type { DayGroup, UpcomingOccurrence } from './models';

const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';

// en-CA formats as YYYY-MM-DD, matching the ISO dates the server sends. An
// explicit IANA zone stays correct across Israel's DST transitions, unlike
// `new Date().toISOString()`.
const todayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: ISRAEL_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
export const todayInIsrael = (): string => todayFormatter.format(new Date());

// Done in UTC, never the browser's own timezone: this only ever adds whole
// days to a date-only string, never a clock time.
export const addDays = (isoDate: string, days: number): string => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const weekdayFormatter = new Intl.DateTimeFormat('he-IL', { weekday: 'long', timeZone: 'UTC' });
const fullDateFormatter = new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const compactDateFormatter = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', timeZone: 'UTC' });

export interface DayHeading {
  boldLabel: string;
  dateLabel: string;
}

// `היום` / `מחר` / the weekday name, next to the full date (design doc,
// section 3). The bold word already carries the weekday for today and
// tomorrow, so the date beside it there is the full "weekday, day month";
// for any other day the weekday itself is the bold word, so the date
// beside it is day+month only, matching the mockup.
export const dayHeading = (isoDate: string, todayIso: string): DayHeading => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (isoDate === todayIso) return { boldLabel: consts.TODAY_LABEL, dateLabel: fullDateFormatter.format(date) };
  if (isoDate === addDays(todayIso, 1)) return { boldLabel: consts.TOMORROW_LABEL, dateLabel: fullDateFormatter.format(date) };
  return { boldLabel: weekdayFormatter.format(date), dateLabel: compactDateFormatter.format(date) };
};

// The cancel sheet's sentence needs the same "weekday, day month" text
// glued after "ב" (`cancelConfirmBody`), independent of which bold word a
// day group used.
export const fullDateLabel = (isoDate: string): string => fullDateFormatter.format(new Date(`${isoDate}T00:00:00Z`));

// The server already returns occurrences sorted by date (then status, then
// time), so grouping is a single pass with no re-sort.
export const groupByDay = (occurrences: UpcomingOccurrence[]): DayGroup[] => {
  const groups: DayGroup[] = [];
  for (const occurrence of occurrences) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === occurrence.date) lastGroup.occurrences.push(occurrence);
    else groups.push({ date: occurrence.date, occurrences: [occurrence] });
  }
  return groups;
};

const titleFallback = (lesson: RabbiLessonResponse | undefined): string => {
  if (!lesson) return consts.ONE_TIME_FALLBACK_TITLE;
  return lesson.recurrence.kind === 'weekly' ? consts.RECURRING_FALLBACK_TITLE : consts.ONE_TIME_FALLBACK_TITLE;
};

// True on any difference in name, street, or city, in any combination:
// one flag for the whole place, never one per field (design doc, section 3).
const hasPlaceChanged = (lesson: RabbiLessonResponse | undefined, occurrencePlace: LessonOccurrence['place']): boolean => {
  if (!lesson) return false;
  return lesson.place.name !== occurrencePlace.name || lesson.place.street !== occurrencePlace.street || lesson.place.cityName !== occurrencePlace.city;
};

// Attaches, per occurrence, whether its time or place were moved off the
// lesson's own recurring values: the wire `LessonOccurrence` carries only
// the resolved values, never the lesson's base ones, so this is the one
// place that comparison happens rather than every card re-deriving it.
export const withDerivedFields = (occurrences: LessonOccurrence[], lessonsById: Map<string, RabbiLessonResponse>): UpcomingOccurrence[] =>
  occurrences.map((occurrence) => {
    const lesson = lessonsById.get(occurrence.lessonId);
    const baseStartTime = lesson?.startTime;
    const wasMoved = occurrence.status === 'scheduled' && baseStartTime !== undefined && baseStartTime !== occurrence.startTime;
    return {
      ...occurrence,
      movedFromTime: wasMoved ? baseStartTime : undefined,
      placeChanged: occurrence.status === 'scheduled' && hasPlaceChanged(lesson, occurrence.place),
      titleFallback: titleFallback(lesson),
    };
  });
