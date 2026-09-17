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
// the exception record a write has to address. This is the one place that
// join happens, by date, so no row is ever fetched on its own (root
// CLAUDE.md, Async and data access). `hasExistingException` is computed
// once here, off the occurrence's own resolved fields, and reused by both
// `canWriteRow` (below) and `OccurrenceRow.tsx` (whether Restore renders),
// rather than each recomputing it.
export const joinOccurrencesWithExceptions = (
  occurrences: LessonOccurrence[],
  exceptions: LessonExceptionResponse[],
  lesson: LessonResponse,
): OccurrenceRowData[] => {
  const exceptionByDate = new Map(exceptions.map((exception) => [exception.date, exception] as const));

  return occurrences.map((occurrence) => {
    const movedFromTime = occurrence.status === 'scheduled' && occurrence.startTime !== lesson.startTime ? lesson.startTime : undefined;
    const placeChanged = occurrence.status === 'scheduled' && hasPlaceChanged(lesson, occurrence.place);

    return {
      date: occurrence.date,
      dateLabel: occurrenceDateLabel(occurrence.date),
      startTime: occurrence.startTime,
      status: occurrence.status,
      placeName: occurrence.place.name,
      cityName: occurrence.place.city,
      cancellationReason: occurrence.cancellationReason,
      movedFromTime,
      placeChanged,
      hasExistingException: occurrence.status === 'cancelled' || movedFromTime !== undefined || placeChanged,
      existingException: exceptionByDate.get(occurrence.date),
      substituteRabbi: occurrence.substituteRabbi,
      note: occurrence.note,
    };
  });
};

// False only when a date already has an exception and the exceptions fetch
// that would carry it has failed (`OccurrencesSection.tsx`'s
// `exceptionsUnavailable` state passes every row through this join with an
// empty exceptions list, so `existingException` is undefined everywhere).
export const canWriteRow = (row: OccurrenceRowData): boolean => !row.hasExistingException || row.existingException !== undefined;
