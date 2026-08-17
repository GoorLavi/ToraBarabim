import type { City, CreateLessonRequest, Lesson, Place, Rabbi } from '@torabarabim/common';

import * as consts from './consts';
import type { LessonFormErrors, LessonFormState } from './models';

export const initialFormState = (preselectedRabbi: Rabbi | undefined): LessonFormState => ({
  rabbi: preselectedRabbi,
  title: '',
  recurrenceKind: 'weekly',
  weekdays: [],
  date: '',
  startTime: '',
  durationMinutes: consts.DEFAULT_DURATION_MINUTES,
  city: undefined,
  placeName: '',
  placeAddress: '',
  audience: undefined,
});

export const lessonToFormState = (lesson: Lesson, rabbi: Rabbi | undefined, place: Place | undefined, city: City | undefined): LessonFormState => ({
  rabbi,
  title: lesson.title ?? '',
  recurrenceKind: lesson.recurrence.kind,
  weekdays: lesson.recurrence.kind === 'weekly' ? lesson.recurrence.weekdays : [],
  date: lesson.recurrence.kind === 'once' ? lesson.recurrence.date : '',
  startTime: lesson.startTime,
  durationMinutes: String(lesson.durationMinutes),
  city,
  placeName: place?.name ?? '',
  placeAddress: place?.address ?? '',
  audience: lesson.audience,
});

export const pageHeading = (form: LessonFormState): string => form.title || form.rabbi?.name || consts.NEW_LESSON_HEADING;

export const validateLessonForm = (form: LessonFormState): LessonFormErrors => {
  const errors: LessonFormErrors = {};

  if (!form.rabbi) errors.rabbi = consts.REQUIRED_RABBI_ERROR;
  if (!form.city) errors.city = consts.REQUIRED_CITY_ERROR;
  if (!form.placeName.trim()) errors.placeName = consts.REQUIRED_PLACE_NAME_ERROR;
  if (!form.placeAddress.trim()) errors.placeAddress = consts.REQUIRED_PLACE_ADDRESS_ERROR;
  if (!form.audience) errors.audience = consts.REQUIRED_AUDIENCE_ERROR;
  if (!form.startTime) errors.startTime = consts.REQUIRED_START_TIME_ERROR;

  const duration = Number(form.durationMinutes);
  if (!Number.isInteger(duration) || duration <= 0) errors.durationMinutes = consts.REQUIRED_DURATION_ERROR;

  if (form.recurrenceKind === 'weekly' && form.weekdays.length === 0) errors.recurrence = consts.REQUIRED_WEEKDAY_ERROR;
  if (form.recurrenceKind === 'once' && !form.date) errors.recurrence = consts.REQUIRED_DATE_ERROR;

  return errors;
};

// A short "when" label for the live preview card, tolerant of a draft that
// is not yet valid (no weekday or date chosen yet), unlike
// `LessonsListPage/helpers.ts`'s `recurrenceWhenLabel`, which assumes a
// complete, saved `Lesson`.
export const previewWeekdayLabel = (form: LessonFormState): string | undefined => {
  if (form.recurrenceKind === 'weekly') {
    if (form.weekdays.length === 0) return undefined;
    return form.weekdays.map((weekday) => consts.WEEKDAY_LABELS_FULL[weekday]).join(' / ');
  }
  if (!form.date) return undefined;
  const weekday = new Date(`${form.date}T00:00:00Z`).getUTCDay();
  return consts.WEEKDAY_LABELS_FULL[weekday];
};

// Assumes the caller already resolved a `placeId` (creating or updating
// the place from `form.city`/`placeName`/`placeAddress`) and already
// validated the form, so `form.rabbi`/`city`/`audience` are known present.
export const buildLessonPayload = (form: LessonFormState, placeId: string): CreateLessonRequest => {
  if (!form.rabbi || !form.audience) {
    throw new Error('buildLessonPayload called before the form passed validation');
  }

  return {
    title: form.title.trim() || undefined,
    rabbiId: form.rabbi.id,
    placeId,
    audience: form.audience,
    recurrence:
      form.recurrenceKind === 'weekly' ? { kind: 'weekly', weekdays: form.weekdays } : { kind: 'once', date: form.date },
    startTime: form.startTime,
    durationMinutes: Number(form.durationMinutes),
  };
};
