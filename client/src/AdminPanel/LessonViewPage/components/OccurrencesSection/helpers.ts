import type { LessonExceptionResponse, LessonOccurrence, LessonResponse } from '@torabarabim/common';

import { WEEKDAY_LABELS } from '~/AdminPanel/consts';
import { asWeekday, formatIsraeliDate } from '~/AdminPanel/helpers';

import type { OccurrenceRowData } from './models';

export const occurrenceDateLabel = (isoDate: string): string => {
  const weekday = asWeekday(new Date(`${isoDate}T00:00:00Z`).getUTCDay());
  return `${WEEKDAY_LABELS[weekday]}, ${formatIsraeliDate(isoDate)}`;
};

const hasPlaceChanged = (lesson: LessonResponse, place: LessonOccurrence['place']): boolean =>
  lesson.place.name !== place.name || lesson.place.street !== place.street || lesson.place.cityName !== place.city;

// One occurrence date needs two independent fetches: `AdminOccurrenceListResponse`
// for the resolved time/place/status, and `LessonExceptionListResponse` for
// the numeric exception id a write has to address. This is the one place
// that join happens, by date, so no row is ever fetched on its own (root
// CLAUDE.md, Async and data access).
export const joinOccurrencesWithExceptions = (
  occurrences: LessonOccurrence[],
  exceptions: LessonExceptionResponse[],
  lesson: LessonResponse,
): OccurrenceRowData[] => {
  const exceptionIdByDate = new Map(exceptions.map((exception) => [exception.date, exception.id] as const));

  return occurrences.map((occurrence) => ({
    date: occurrence.date,
    dateLabel: occurrenceDateLabel(occurrence.date),
    startTime: occurrence.startTime,
    status: occurrence.status,
    placeName: occurrence.place.name,
    cityName: occurrence.place.city,
    cancellationReason: occurrence.cancellationReason,
    exceptionId: exceptionIdByDate.get(occurrence.date),
    movedFromTime: occurrence.status === 'scheduled' && occurrence.startTime !== lesson.startTime ? lesson.startTime : undefined,
    placeChanged: occurrence.status === 'scheduled' && hasPlaceChanged(lesson, occurrence.place),
  }));
};

// True when this date already carries an exception record, whether or not
// its id actually resolved: cancelled and moved are both derived straight
// off the occurrence's own resolved fields, so this is known even while
// the exceptions fetch is still failing. Writing to a date in this state
// has to address the existing exception (PATCH/DELETE), so it needs the
// id; a plain scheduled date can always be written with a fresh POST.
export const hasExistingException = (row: OccurrenceRowData): boolean =>
  row.status === 'cancelled' || row.movedFromTime !== undefined || row.placeChanged;

// False only when a date already has an exception and the exceptions fetch
// that would carry its id has failed (`OccurrencesSection.tsx`'s
// `exceptionsUnavailable` state passes every row through this with an
// empty exceptions list, so `exceptionId` is undefined everywhere).
export const canWriteRow = (row: OccurrenceRowData): boolean => !hasExistingException(row) || row.exceptionId !== undefined;
