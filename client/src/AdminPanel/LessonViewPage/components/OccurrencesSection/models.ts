import type { LessonResponse } from '@torabarabim/common';

// One occurrence date, joined from `AdminOccurrenceListResponse` (the
// resolved time/place/status for this date) and `LessonExceptionListResponse`
// (the numeric id of the exception on this date, if any). See
// `helpers.ts`'s `joinOccurrencesWithExceptions`, the one place that join
// happens.
export interface OccurrenceRowData {
  date: string;
  dateLabel: string;
  startTime: string;
  status: 'scheduled' | 'cancelled';
  placeName: string;
  cityName: string;
  cancellationReason: string | undefined;
  // The exception's id when the exceptions list resolved and this date
  // carries one. Undefined either because the date has no exception yet,
  // or because the exceptions fetch failed and the id could not be
  // resolved (see `OccurrencesSection.tsx`'s `exceptionsUnavailable`
  // state): `hasExistingException` below is what tells those two apart.
  exceptionId: number | undefined;
  // The lesson's own recurring start time, present only when this date's
  // time was moved away from it.
  movedFromTime: string | undefined;
  // True when this date's place differs from the lesson's own base place
  // in any of name, street, or city: one flag for the whole place, never
  // one per field, matching the design's single "הכתובת שונתה" tag.
  placeChanged: boolean;
}

export type OccurrencesSectionState =
  | { status: 'pending' }
  | { status: 'error'; retry: () => void }
  | { status: 'empty' }
  // Occurrences resolved but the exceptions fetch failed: the list still
  // renders (every field a row needs besides the exception id comes
  // straight off the occurrence itself), but a date that already carries
  // an exception cannot be edited or restored without that id.
  | { status: 'exceptionsUnavailable'; rows: OccurrenceRowData[]; retry: () => void }
  | { status: 'success'; rows: OccurrenceRowData[] };

export type ActiveSheet = { kind: 'cancel' | 'move'; row: OccurrenceRowData } | undefined;

export interface OccurrencesSectionProps {
  className?: string;
  lessonId: string;
  lesson: LessonResponse;
}
