import type { LessonAudience, LessonException, LessonTopic, Rabbi, Recurrence, Weekday } from '@torabarabim/common';

import type { lessonExceptions, lessons } from '../../db/schema';
import { toVenue, type AddressCityRow, type AddressPlaceRow, type VenueRef } from '../shared/address';
import { addDays, compareIsoDates, weekdayOf } from './israel-time';
import type { ResolvedLessonOccurrence } from './models';

// The domain shape a `lessons` row expands into. Distinct from the wire
// `Lesson` (`@torabarabim/common`): that one carries `venue` as an
// unresolved *input* (`LessonVenueInput`, what a create/update names), while
// this one always knows `cityCode` regardless of which arm is set (the
// chokepoint's denormalized column), and a place arm here carries only the
// id, never a resolved name or street: those come from `places` only at
// render time (`toVenue`), so a renamed or deactivated place is never
// stale in an already-expanded occurrence.
export interface Lesson {
  id: string;
  title?: string;
  rabbiId: string;
  venue: VenueRef;
  topic?: LessonTopic;
  audience: LessonAudience;
  recurrence: Recurrence;
  startTime: string;
  durationMinutes: number;
  notes?: string;
}

export interface RawOccurrence {
  lesson: Lesson;
  date: string; // ISO date
}

// Inclusive of both `from` and `to`; exceptions are applied separately,
// by `applyException`.
export const expandLesson = (lesson: Lesson, from: string, to: string): RawOccurrence[] => {
  const { recurrence } = lesson;

  if (recurrence.kind === 'once') {
    const inRange =
      compareIsoDates(recurrence.date, from) >= 0 && compareIsoDates(recurrence.date, to) <= 0;
    return inRange ? [{ lesson, date: recurrence.date }] : [];
  }

  const weekdays = new Set<Weekday>(recurrence.weekdays);
  const occurrences: RawOccurrence[] = [];
  let cursor = from;
  while (compareIsoDates(cursor, to) <= 0) {
    if (weekdays.has(weekdayOf(cursor))) {
      occurrences.push({ lesson, date: cursor });
    }
    cursor = addDays(cursor, 1);
  }
  return occurrences;
};

export interface ResolvedOccurrence {
  lesson: Lesson;
  date: string;
  startTime: string;
  venue: VenueRef;
  status: 'scheduled' | 'cancelled';
  substituteRabbiId?: string;
  cancellationReason?: string;
  note?: string;
}

// The recurrence rule itself is never touched, so this only ever affects
// the one date named by `exception`. An exception's own override is always
// a free address, never a place: overriding one date is a correction for
// that date, not a reason to register a venue, so it replaces the lesson's
// venue outright rather than merging into it.
export const applyException = (
  occurrence: RawOccurrence,
  exception: LessonException | undefined,
): ResolvedOccurrence => {
  const base: ResolvedOccurrence = {
    lesson: occurrence.lesson,
    date: occurrence.date,
    startTime: occurrence.lesson.startTime,
    venue: occurrence.lesson.venue,
    status: 'scheduled',
  };

  if (!exception) return base;

  if (exception.kind === 'cancelled') {
    return { ...base, status: 'cancelled', cancellationReason: exception.reason };
  }

  return {
    ...base,
    startTime: exception.startTime ?? base.startTime,
    venue: exception.address
      ? { kind: 'address', name: exception.address.name, street: exception.address.street, floor: exception.address.floor, cityCode: exception.address.cityCode }
      : base.venue,
    substituteRabbiId: exception.substituteRabbiId,
    note: exception.note,
  };
};

type LessonRow = typeof lessons.$inferSelect;
type ExceptionRow = typeof lessonExceptions.$inferSelect;

// The one place a `lessons` row becomes the domain `Lesson` shape that
// `expandLesson` expects. Shared by every caller that expands a
// recurrence rule: the public search, a lesson's own occurrence, a
// rabbi's upcoming occurrences, and an admin's occurrences for one lesson.
export const toLessonDomain = (row: LessonRow): Lesson => ({
  id: row.id,
  title: row.title ?? undefined,
  rabbiId: row.rabbiId,
  // The `lessons_venue_shape` check constraint guarantees exactly one arm
  // is set; TS cannot see a DB constraint.
  venue:
    row.placeId !== null
      ? { kind: 'place', placeId: row.placeId, cityCode: row.cityCode }
      : { kind: 'address', name: row.addressName as string, street: row.addressStreet as string, floor: row.addressFloor ?? undefined, cityCode: row.cityCode },
  topic: row.topic ?? undefined,
  audience: row.audience,
  // The `lessons_recurrence_shape` check constraint guarantees weekdays is
  // set for 'weekly' and date is set for 'once'; TS cannot see a DB constraint.
  recurrence:
    row.recurrenceKind === 'weekly'
      ? { kind: 'weekly', weekdays: row.recurrenceWeekdays as Weekday[] }
      : { kind: 'once', date: row.recurrenceDate as string },
  startTime: row.startTime,
  durationMinutes: row.durationMinutes,
  notes: row.notes ?? undefined,
});

export const toExceptionDomain = (row: ExceptionRow): LessonException =>
  row.kind === 'cancelled'
    ? { kind: 'cancelled', lessonId: row.lessonId, date: row.date, reason: row.reason ?? undefined }
    : {
        kind: 'modified',
        lessonId: row.lessonId,
        date: row.date,
        startTime: row.startTime ?? undefined,
        address:
          row.addressName !== null && row.addressStreet !== null && row.cityCode !== null
            ? { name: row.addressName, street: row.addressStreet, floor: row.addressFloor ?? undefined, cityCode: row.cityCode }
            : undefined,
        substituteRabbiId: row.substituteRabbiId ?? undefined,
        note: row.note ?? undefined,
      };

const MINUTES_PER_DAY = 24 * 60;

export const addMinutes = (startTime: string, minutes: number): string => {
  const [hoursText, minutesText] = startTime.split(':');
  const total = Number(hoursText) * 60 + Number(minutesText) + minutes;
  const wrapped = ((total % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const STATUS_ORDER = { scheduled: 0, cancelled: 1 } as const;

// Cancelled occurrences stay in the result and sort after scheduled ones
// on the same day; the client dims them rather than the API hiding them.
export const compareOccurrences = (a: ResolvedOccurrence, b: ResolvedOccurrence): number => {
  const byDate = compareIsoDates(a.date, b.date);
  if (byDate !== 0) return byDate;

  const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
  if (byStatus !== 0) return byStatus;

  return a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0;
};

export const resolveRecord = (
  occurrence: ResolvedOccurrence,
  rabbiById: Map<string, Rabbi>,
  cityByCode: Map<number, AddressCityRow>,
  placeById: Map<string, AddressPlaceRow>,
): ResolvedLessonOccurrence => {
  const rabbi = rabbiById.get(occurrence.lesson.rabbiId);
  if (!rabbi) {
    throw new Error(`data inconsistency: lesson ${occurrence.lesson.id} references unknown rabbi ${occurrence.lesson.rabbiId}`);
  }

  return {
    lessonId: occurrence.lesson.id,
    date: occurrence.date,
    startTime: occurrence.startTime,
    endTime: addMinutes(occurrence.startTime, occurrence.lesson.durationMinutes),
    status: occurrence.status,
    title: occurrence.lesson.title,
    topic: occurrence.lesson.topic,
    audience: occurrence.lesson.audience,
    rabbi,
    venue: toVenue(occurrence.venue, cityByCode, placeById),
    substituteRabbi: occurrence.substituteRabbiId
      ? rabbiById.get(occurrence.substituteRabbiId)
      : undefined,
    cancellationReason: occurrence.cancellationReason,
    note: occurrence.note,
  };
};
