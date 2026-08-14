import type { Lesson, LessonException, Weekday } from '@torabarabim/common';

import { addDays, compareIsoDates, weekdayOf } from './israel-time';

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
  placeId: string;
  status: 'scheduled' | 'cancelled';
  substituteRabbiId?: string;
  cancellationReason?: string;
  note?: string;
}

// The recurrence rule itself is never touched, so this only ever affects
// the one date named by `exception`.
export const applyException = (
  occurrence: RawOccurrence,
  exception: LessonException | undefined,
): ResolvedOccurrence => {
  const base: ResolvedOccurrence = {
    lesson: occurrence.lesson,
    date: occurrence.date,
    startTime: occurrence.lesson.startTime,
    placeId: occurrence.lesson.placeId,
    status: 'scheduled',
  };

  if (!exception) return base;

  if (exception.kind === 'cancelled') {
    return { ...base, status: 'cancelled', cancellationReason: exception.reason };
  }

  return {
    ...base,
    startTime: exception.startTime ?? base.startTime,
    placeId: exception.placeId ?? base.placeId,
    substituteRabbiId: exception.substituteRabbiId,
    note: exception.note,
  };
};
