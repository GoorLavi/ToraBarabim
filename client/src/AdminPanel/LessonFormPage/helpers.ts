import type { CreateLessonRequest, LessonResponse, LessonVenueInput, Rabbi } from '@torabarabim/common';

import { WEEKDAY_LABELS } from '~/AdminPanel/consts';
import { asWeekday } from '~/AdminPanel/helpers';
import type { SelectedCity } from '~/components/CitySelect/models';
import * as placePickerConsts from '~/components/PlacePicker/consts';
import type { LessonVenueFormState } from '~/components/PlacePicker/models';
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
  venue: { kind: 'address', name: '', street: '', floor: '' },
  audience: undefined,
});

// The place arm carries its own city on `venue.place`, so `city` stays
// unset for a place-backed lesson: `PlacePicker` reads the locked city
// straight off the place, never through `CitySelect`.
const venueFromLesson = (lesson: LessonResponse): LessonVenueFormState =>
  lesson.venue.kind === 'place'
    ? {
        kind: 'place',
        place: {
          id: lesson.venue.placeId,
          slug: lesson.venue.slug,
          name: lesson.venue.name,
          street: lesson.venue.street,
          floor: lesson.venue.floor,
          city: lesson.venue.city,
          citySlug: lesson.venue.citySlug,
          area: lesson.venue.area,
          isActive: true,
        },
      }
    : { kind: 'address', name: lesson.venue.name, street: lesson.venue.street, floor: lesson.venue.floor ?? '' };

export const lessonToFormState = (lesson: LessonResponse, rabbi: Rabbi | undefined, city: SelectedCity | undefined): LessonFormState => ({
  rabbi,
  title: lesson.title ?? '',
  recurrenceKind: lesson.recurrence.kind,
  weekdays: lesson.recurrence.kind === 'weekly' ? lesson.recurrence.weekdays : [],
  date: lesson.recurrence.kind === 'once' ? lesson.recurrence.date : '',
  startTime: lesson.startTime,
  durationMinutes: String(lesson.durationMinutes),
  city,
  venue: venueFromLesson(lesson),
  audience: lesson.audience,
});

export const pageHeading = (form: LessonFormState): string =>
  form.title || (form.rabbi && rabbiDisplayName(form.rabbi)) || consts.NEW_LESSON_HEADING;

// The live preview card's city line: a chosen place carries its own city,
// never through `form.city`, which only holds a value for the free-text arm.
export const previewCityName = (form: LessonFormState): string | undefined =>
  form.venue.kind === 'place' ? form.venue.place.city : form.city?.name;

export const validateLessonForm = (form: LessonFormState): LessonFormErrors => {
  const errors: LessonFormErrors = {};

  if (!form.rabbi) errors.rabbi = consts.REQUIRED_RABBI_ERROR;

  // A chosen place is always a complete, valid venue on its own: there is
  // nothing left to require. Only the free-text arm needs a city and a
  // filled-in name and street.
  if (form.venue.kind === 'address') {
    if (!form.city) errors.city = placePickerConsts.REQUIRED_CITY_ERROR;
    if (!form.venue.name.trim()) errors.addressName = placePickerConsts.REQUIRED_ADDRESS_NAME_ERROR;
    if (!form.venue.street.trim()) errors.street = placePickerConsts.REQUIRED_STREET_ERROR;
  }

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
  if (current.venue.kind !== baseline.venue.kind) return true;

  if (current.venue.kind === 'place' && baseline.venue.kind === 'place') {
    if (current.venue.place.id !== baseline.venue.place.id) return true;
  } else if (current.venue.kind === 'address' && baseline.venue.kind === 'address') {
    if (current.city?.id !== baseline.city?.id) return true;
    if (current.venue.name.trim() !== baseline.venue.name.trim()) return true;
    if (current.venue.street.trim() !== baseline.venue.street.trim()) return true;
    if (current.venue.floor.trim() !== baseline.venue.floor.trim()) return true;
  }

  if (current.audience !== baseline.audience) return true;

  return false;
};

// Assumes the form already passed validation, so `form.rabbi`/`audience`
// are known present, and `form.city` is present whenever `form.venue` is
// still the address arm.
export const buildLessonPayload = (form: LessonFormState): CreateLessonRequest => {
  if (!form.rabbi || !form.audience) {
    throw new Error('buildLessonPayload called before the form passed validation');
  }
  if (form.venue.kind === 'address' && !form.city) {
    throw new Error('buildLessonPayload called before the form passed validation');
  }

  const venue: LessonVenueInput =
    form.venue.kind === 'place'
      ? { kind: 'place', placeId: form.venue.place.id }
      : {
          kind: 'address',
          name: form.venue.name.trim(),
          street: form.venue.street.trim(),
          floor: form.venue.floor.trim() || undefined,
          cityCode: Number((form.city as SelectedCity).id),
        };

  return {
    title: form.title.trim() || undefined,
    rabbiId: form.rabbi.id,
    venue,
    audience: form.audience,
    recurrence:
      form.recurrenceKind === 'weekly' ? { kind: 'weekly', weekdays: form.weekdays } : { kind: 'once', date: form.date },
    startTime: form.startTime,
    durationMinutes: Number(form.durationMinutes),
  };
};
