import type { PlaceCreateLessonRequest, PlaceLessonResponse } from '@torabarabim/common';

import * as consts from './consts';
import type { LessonFormErrors, LessonFormState } from './models';

export const initialFormState = (): LessonFormState => ({
  rabbi: undefined,
  title: '',
  recurrenceKind: 'weekly',
  weekdays: [],
  date: '',
  startTime: '',
  durationMinutes: consts.DEFAULT_DURATION_MINUTES,
  audience: undefined,
  topic: '',
  notes: '',
});

// `rabbi` is filled in separately, once `fetchRabbiById(lesson.rabbiId)`
// resolves: the lesson response itself carries only the bare `rabbiId`
// (`common/src/admin.ts`'s `LessonResponse`, which `PlaceLessonResponse`
// reuses), never a resolved name.
export const lessonToFormState = (lesson: PlaceLessonResponse): Omit<LessonFormState, 'rabbi'> => ({
  title: lesson.title ?? '',
  recurrenceKind: lesson.recurrence.kind,
  weekdays: lesson.recurrence.kind === 'weekly' ? lesson.recurrence.weekdays : [],
  date: lesson.recurrence.kind === 'once' ? lesson.recurrence.date : '',
  startTime: lesson.startTime,
  durationMinutes: String(lesson.durationMinutes),
  audience: lesson.audience,
  topic: lesson.topic ?? '',
  notes: lesson.notes ?? '',
});

// A static heading per mode, mirroring `RabbiPanel/LessonFormPage/helpers.ts`'s
// `pageHeading` exactly: neither name is specific to a rabbi or a venue.
export const pageHeading = (isEditing: boolean): string => (isEditing ? consts.EDIT_HEADING : consts.NEW_HEADING);

export const validateLessonForm = (form: LessonFormState): LessonFormErrors => {
  const errors: LessonFormErrors = {};

  if (!form.rabbi) errors.rabbi = consts.REQUIRED_RABBI_ERROR;
  if (!form.audience) errors.audience = consts.REQUIRED_AUDIENCE_ERROR;
  if (!form.startTime) errors.startTime = consts.REQUIRED_START_TIME_ERROR;

  const duration = Number(form.durationMinutes);
  if (!Number.isInteger(duration) || duration <= 0) errors.durationMinutes = consts.REQUIRED_DURATION_ERROR;

  if (form.recurrenceKind === 'weekly' && form.weekdays.length === 0) errors.recurrence = consts.REQUIRED_WEEKDAY_ERROR;
  if (form.recurrenceKind === 'once' && !form.date) errors.recurrence = consts.REQUIRED_DATE_ERROR;

  return errors;
};

// Assumes the form already passed validation, so `rabbi`/`audience` are
// known present. No `venue` in the payload at all (build brief): the
// server supplies it from the session and refuses a payload that carries
// one.
export const buildLessonPayload = (form: LessonFormState): PlaceCreateLessonRequest => {
  if (!form.rabbi || !form.audience) {
    throw new Error('buildLessonPayload called before the form passed validation');
  }

  return {
    title: form.title.trim() || undefined,
    rabbiId: form.rabbi.id,
    topic: form.topic || undefined,
    audience: form.audience,
    recurrence: form.recurrenceKind === 'weekly' ? { kind: 'weekly', weekdays: form.weekdays } : { kind: 'once', date: form.date },
    startTime: form.startTime,
    durationMinutes: Number(form.durationMinutes),
    notes: form.notes.trim() || undefined,
  };
};
