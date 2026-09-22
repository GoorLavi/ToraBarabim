import type { CreateLessonRequest, LessonResponse, Rabbi } from '@torabarabim/common';

import { WEEKDAY_LABELS } from '~/AdminPanel/consts';
import { asWeekday } from '~/AdminPanel/helpers';
import type { SelectedCity } from '~/components/CitySelect/models';
import { rabbiDisplayName } from '~/helpers';

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
  addressName: '',
  street: '',
  floor: '',
  audience: undefined,
});

export const lessonToFormState = (lesson: LessonResponse, rabbi: Rabbi | undefined, city: SelectedCity | undefined): LessonFormState => ({
  rabbi,
  title: lesson.title ?? '',
  recurrenceKind: lesson.recurrence.kind,
  weekdays: lesson.recurrence.kind === 'weekly' ? lesson.recurrence.weekdays : [],
  date: lesson.recurrence.kind === 'once' ? lesson.recurrence.date : '',
  startTime: lesson.startTime,
  durationMinutes: String(lesson.durationMinutes),
  city,
  addressName: lesson.venue.name,
  street: lesson.venue.street,
  floor: lesson.venue.floor ?? '',
  audience: lesson.audience,
});

export const pageHeading = (form: LessonFormState): string =>
  form.title || (form.rabbi && rabbiDisplayName(form.rabbi)) || consts.NEW_LESSON_HEADING;

export const validateLessonForm = (form: LessonFormState): LessonFormErrors => {
  const errors: LessonFormErrors = {};

  if (!form.rabbi) errors.rabbi = consts.REQUIRED_RABBI_ERROR;
  if (!form.city) errors.city = consts.REQUIRED_CITY_ERROR;
  if (!form.addressName.trim()) errors.addressName = consts.REQUIRED_ADDRESS_NAME_ERROR;
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
// is not yet valid (no weekday or date chosen yet), unlike
// `LessonsListPage/helpers.ts`'s `recurrenceWhenLabel`, which assumes a
// complete, saved `Lesson`.
export const previewWeekdayLabel = (form: LessonFormState): string | undefined => {
  if (form.recurrenceKind === 'weekly') {
    if (form.weekdays.length === 0) return undefined;
    return form.weekdays.map((weekday) => WEEKDAY_LABELS[weekday]).join(' / ');
  }
  if (!form.date) return undefined;
  const weekday = asWeekday(new Date(`${form.date}T00:00:00Z`).getUTCDay());
  return WEEKDAY_LABELS[weekday];
};

// Whether the form has moved away from what was loaded, for the edit
// path's cancel-confirm sheet. Weekday sets compare unordered, since
// toggling days off and back on can leave the array in a different order
// than the server returned without the selection actually having changed.
export const isLessonFormDirty = (current: LessonFormState, baseline: LessonFormState): boolean => {
  if (current.rabbi?.id !== baseline.rabbi?.id) return true;
  if (current.title.trim() !== baseline.title.trim()) return true;
  if (current.recurrenceKind !== baseline.recurrenceKind) return true;

  if (current.recurrenceKind === 'weekly') {
    const currentDays = [...current.weekdays].sort();
    const baselineDays = [...baseline.weekdays].sort();
    if (currentDays.length !== baselineDays.length || currentDays.some((day, index) => day !== baselineDays[index])) return true;
  } else if (current.date !== baseline.date) {
    return true;
  }

  if (current.startTime !== baseline.startTime) return true;
  if (current.durationMinutes !== baseline.durationMinutes) return true;
  if (current.city?.id !== baseline.city?.id) return true;
  if (current.addressName.trim() !== baseline.addressName.trim()) return true;
  if (current.street.trim() !== baseline.street.trim()) return true;
  if (current.floor.trim() !== baseline.floor.trim()) return true;
  if (current.audience !== baseline.audience) return true;

  return false;
};

// Assumes the form already passed validation, so `form.rabbi`/`city`/
// `audience` are known present.
export const buildLessonPayload = (form: LessonFormState): CreateLessonRequest => {
  if (!form.rabbi || !form.city || !form.audience) {
    throw new Error('buildLessonPayload called before the form passed validation');
  }

  return {
    title: form.title.trim() || undefined,
    rabbiId: form.rabbi.id,
    venue: {
      kind: 'address',
      name: form.addressName.trim(),
      street: form.street.trim(),
      floor: form.floor.trim() || undefined,
      cityCode: Number(form.city.id),
    },
    audience: form.audience,
    recurrence:
      form.recurrenceKind === 'weekly' ? { kind: 'weekly', weekdays: form.weekdays } : { kind: 'once', date: form.date },
    startTime: form.startTime,
    durationMinutes: Number(form.durationMinutes),
  };
};
