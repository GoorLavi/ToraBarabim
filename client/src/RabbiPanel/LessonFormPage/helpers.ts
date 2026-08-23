import type { RabbiCreateLessonRequest, RabbiLessonResponse } from '@torabarabim/common';

import * as consts from './consts';
import type { LessonFormErrors, LessonFormState } from './models';

export const initialFormState = (): LessonFormState => ({
  title: '',
  recurrenceKind: 'weekly',
  weekdays: [],
  date: '',
  startTime: '',
  durationMinutes: consts.DEFAULT_DURATION_MINUTES,
  city: undefined,
  placeName: '',
  street: '',
  floor: '',
  audience: undefined,
});

export const lessonToFormState = (lesson: RabbiLessonResponse): LessonFormState => ({
  title: lesson.title ?? '',
  recurrenceKind: lesson.recurrence.kind,
  weekdays: lesson.recurrence.kind === 'weekly' ? lesson.recurrence.weekdays : [],
  date: lesson.recurrence.kind === 'once' ? lesson.recurrence.date : '',
  startTime: lesson.startTime,
  durationMinutes: String(lesson.durationMinutes),
  city: { id: String(lesson.place.cityCode), name: lesson.place.cityName },
  placeName: lesson.place.name,
  street: lesson.place.street,
  floor: lesson.place.floor ?? '',
  audience: lesson.audience,
});

// A static heading per mode, not derived from the lesson's own title
// (design doc, section 5: the mockup's edit screen reads "עריכת שיעור",
// never the lesson's name).
export const pageHeading = (isEditing: boolean): string => (isEditing ? consts.EDIT_HEADING : consts.NEW_HEADING);

export const validateLessonForm = (form: LessonFormState): LessonFormErrors => {
  const errors: LessonFormErrors = {};

  if (!form.city) errors.city = consts.REQUIRED_CITY_ERROR;
  if (!form.placeName.trim()) errors.placeName = consts.REQUIRED_PLACE_NAME_ERROR;
  if (!form.street.trim()) errors.street = consts.REQUIRED_STREET_ERROR;
  if (!form.audience) errors.audience = consts.REQUIRED_AUDIENCE_ERROR;
  if (!form.startTime) errors.startTime = consts.REQUIRED_START_TIME_ERROR;

  const duration = Number(form.durationMinutes);
  if (!Number.isInteger(duration) || duration <= 0) errors.durationMinutes = consts.REQUIRED_DURATION_ERROR;

  if (form.recurrenceKind === 'weekly' && form.weekdays.length === 0) errors.recurrence = consts.REQUIRED_WEEKDAY_ERROR;
  if (form.recurrenceKind === 'once' && !form.date) errors.recurrence = consts.REQUIRED_DATE_ERROR;

  return errors;
};

// A short "when" label for the live preview card, tolerant of a draft that
// is not yet valid (no weekday or date chosen yet).
export const previewWeekdayLabel = (form: LessonFormState): string | undefined => {
  if (form.recurrenceKind === 'weekly') {
    if (form.weekdays.length === 0) return undefined;
    return form.weekdays.map((weekday) => consts.WEEKDAY_LABELS_FULL[weekday]).join(' / ');
  }
  if (!form.date) return undefined;
  const weekday = new Date(`${form.date}T00:00:00Z`).getUTCDay();
  return consts.WEEKDAY_LABELS_FULL[weekday];
};

// Assumes the form already passed validation, so `city`/`audience` are
// known present. No `rabbiId` in the payload: the server infers the owner
// from the session (`RabbiCreateLessonRequest = Omit<Lesson, 'id' | 'rabbiId'>`).
export const buildLessonPayload = (form: LessonFormState): RabbiCreateLessonRequest => {
  if (!form.city || !form.audience) {
    throw new Error('buildLessonPayload called before the form passed validation');
  }

  return {
    title: form.title.trim() || undefined,
    place: {
      name: form.placeName.trim(),
      street: form.street.trim(),
      floor: form.floor.trim() || undefined,
      cityCode: Number(form.city.id),
    },
    audience: form.audience,
    recurrence: form.recurrenceKind === 'weekly' ? { kind: 'weekly', weekdays: form.weekdays } : { kind: 'once', date: form.date },
    startTime: form.startTime,
    durationMinutes: Number(form.durationMinutes),
  };
};
