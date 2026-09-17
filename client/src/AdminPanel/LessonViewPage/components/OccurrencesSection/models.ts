import type { LessonExceptionResponse, LessonResponse, Rabbi } from '@torabarabim/common';

// One occurrence date, joined from `AdminOccurrenceListResponse` (the
// resolved time/place/status for this date) and `LessonExceptionListResponse`
// (the exception record on this date, if any). See `helpers.ts`'s
// `joinOccurrencesWithExceptions`, the one place that join happens.
export interface OccurrenceRowData {
  date: string;
  dateLabel: string;
  startTime: string;
  status: 'scheduled' | 'cancelled';
  placeName: string;
  cityName: string;
  cancellationReason: string | undefined;
  // The lesson's own recurring start time, present only when this date's
  // time was moved away from it.
  movedFromTime: string | undefined;
  // True when this date's place differs from the lesson's own base place
  // in any of name, street, or city: one flag for the whole place, never
  // one per field, matching the design's single "המקום שונה" tag.
  placeChanged: boolean;
  // Already resolved to a full `Rabbi` (name, honorific) by the
  // occurrences endpoint, straight off `LessonOccurrence.substituteRabbi`:
  // no separate fetch is needed to show who is teaching, only to change
  // who. The move sheet shows this read only; nothing here can set it.
  substituteRabbi: Rabbi | undefined;
  // The occurrence's own resolved note, off `LessonOccurrence.note`. Shown
  // read only next to the substitute rabbi for the same reason: a date's
  // move sheet edits the time and place, and should not hide the two other
  // things already attached to it.
  note: string | undefined;
  // True when this date already carries an exception record (cancelled,
  // or modified in its time or place), computed once here from the
  // occurrence's own resolved fields, so it is known even while the
  // exceptions fetch is failing. Writing to a date in this state has to
  // address the existing exception (PATCH/DELETE), so it needs
  // `existingException`; a plain scheduled date can always be written
  // with a fresh POST.
  hasExistingException: boolean;
  // The exception this date's row is built from, present only when the
  // exceptions fetch resolved and this date carries one. Carrying the
  // whole record, not just its id, lets the move sheet prefill from, and
  // save over, every field it does not itself present a control for
  // (`place.floor`, `substituteRabbiId`, `note`), so a time-only edit
  // does not null them out on the full-replacement write the server does.
  existingException: LessonExceptionResponse | undefined;
}

export type OccurrencesSectionState =
  | { status: 'pending' }
  | { status: 'error'; retry: () => void }
  | { status: 'empty' }
  // Occurrences resolved but the exceptions fetch failed: the list still
  // renders (every field a row needs besides the exception itself comes
  // straight off the occurrence), but a date that already carries an
  // exception cannot be edited or restored without it.
  | { status: 'exceptionsUnavailable'; rows: OccurrenceRowData[]; retry: () => void }
  | { status: 'success'; rows: OccurrenceRowData[] };

export type ActiveSheet = { kind: 'cancel' | 'move'; row: OccurrenceRowData } | undefined;

export interface OccurrencesSectionProps {
  className?: string;
  lesson: LessonResponse;
}
