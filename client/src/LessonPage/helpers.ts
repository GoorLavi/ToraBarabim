import type { LessonOccurrence, LessonOccurrenceDetail, LessonSchedule, Rabbi, Weekday } from '@torabarabim/common';

import { lessonPath, rabbiDisplayName, sharedUrlOf } from '~/helpers';
import { audienceSuffixOf, lessonHeadline, venueNameOrStreet } from '~/lessonCalendar/helpers';

import type { LessonPageApiError } from './api';
import { dayNumberLabel, monthLabel, weekdayLabel } from './components/LessonTicket/helpers';
import * as consts from './consts';

// A 404 is a fact about the lesson, so its screen offers a way out. Every
// other failure is transient, so its screen offers a retry instead: the two
// are never the same screen even though they share a shape (LessonPage.tsx).
export type LessonErrorCopy =
  | { kind: 'not-found'; heading: string; explanation: string }
  | { kind: 'error'; heading: string; explanation: string };

// Status-aware, per client/CLAUDE.md: reads `error.status`, never the raw
// server message. A removed lesson and a bad date both arrive as 404 and
// are shown identically (server/src/api/lessons/index.ts); everything else
// is a generic "could not load" screen.
export const lessonErrorCopy = (error: LessonPageApiError | null): LessonErrorCopy => {
  if (error?.status === 404) {
    return { kind: 'not-found', heading: consts.NOT_FOUND_HEADING, explanation: consts.NOT_FOUND_EXPLANATION };
  }
  return { kind: 'error', heading: consts.SERVER_ERROR_HEADING, explanation: consts.SERVER_ERROR_EXPLANATION };
};

// The substitute teaches this occurrence when one is assigned; otherwise
// it is the lesson's own rabbi. Shared by `LessonTicket`, `LessonNote` and `RabbiBio`.
export const teachingRabbiOf = (occurrence: Pick<LessonOccurrence, 'rabbi' | 'substituteRabbi'>): Rabbi => occurrence.substituteRabbi ?? occurrence.rabbi;

// "יום שלישי, 27 באוגוסט, בשעה 20:30": the one phrase for when an occurrence
// is, read by the share text, the calendar sheet and the report window.
export const occurrenceWhenLabel = (occurrence: Pick<LessonOccurrence, 'date' | 'startTime'>): string =>
  `${weekdayLabel(occurrence.date)}, ${dayNumberLabel(occurrence.date)} ${monthLabel(occurrence.date)}, ${consts.AT_TIME_PREFIX} ${occurrence.startTime}`;

const joinWithAnd = (names: string[]): string => {
  const last = names.at(-1);
  if (names.length < 2 || last === undefined) return names.join('');
  return `${names.slice(0, -1).join(', ')} ו${last}`;
};

const weekdaysLabel = (weekdays: Weekday[]): string => {
  const [only, ...others] = weekdays;
  if (only !== undefined && others.length === 0) {
    return only === consts.SATURDAY ? 'כל שבת' : `כל יום ${consts.WEEKDAY_NAMES[only]}`;
  }
  return `בימי ${joinWithAnd(weekdays.map((weekday) => consts.WEEKDAY_NAMES[weekday]))}`;
};

// "כל יום שלישי בשעה 20:30": the pattern, never a date, so a link shared a
// month ago is still true today.
export const weeklyScheduleLabel = (schedule: Extract<LessonSchedule, { kind: 'weekly' }>): string =>
  `${weekdaysLabel(schedule.weekdays)} ${consts.AT_TIME_PREFIX} ${schedule.startTime}`;

// Three lines, the link not among them: native share adds it on its own last
// line and a copy carries it alone. A one-time lesson names who actually
// teaches it; a weekly one names the lesson's own rabbi, since the pattern
// outlives any one date's substitute. Line 3 names this occurrence's venue,
// so sharing from a date moved to another address names that address.
export const lessonShareText = (occurrence: LessonOccurrenceDetail): string => {
  const { schedule, venue } = occurrence;
  const rabbi = schedule.kind === 'weekly' ? occurrence.rabbi : teachingRabbiOf(occurrence);
  const headline = `${consts.RIGHT_TO_LEFT_MARK}${lessonHeadline(occurrence, rabbiDisplayName(rabbi))}${audienceSuffixOf(occurrence.audience)}`;
  const when = schedule.kind === 'weekly' ? weeklyScheduleLabel(schedule) : occurrenceWhenLabel(occurrence);
  return [headline, when, `${venueNameOrStreet(venue)}, ${venue.city}`].join('\n');
};

// Points at the date the calendar would add when there is one, so a
// recipient never lands on a cancelled or past date of a weekly lesson.
export const lessonShareUrl = (occurrence: LessonOccurrenceDetail): string =>
  sharedUrlOf(lessonPath({ lessonId: occurrence.lessonId, date: occurrence.calendarOccurrence?.date ?? occurrence.date }));

// The report window's "which lesson is this about" block: the lesson, when,
// and where, one fact to a line.
export const lessonReportContextLines = (occurrence: LessonOccurrenceDetail): string[] => [
  lessonHeadline(occurrence, rabbiDisplayName(teachingRabbiOf(occurrence))),
  occurrenceWhenLabel(occurrence),
  `${venueNameOrStreet(occurrence.venue)}, ${occurrence.venue.city}`,
];

// Derived on every render, never stored: calendar only while there is a date
// to add, share while there is a pattern to send or a date to send.
export const lessonActionsOf = (occurrence: LessonOccurrenceDetail): { canShare: boolean; canAddToCalendar: boolean } => {
  const canAddToCalendar = occurrence.calendarOccurrence !== null;
  return { canAddToCalendar, canShare: occurrence.schedule.kind === 'weekly' || canAddToCalendar };
};
