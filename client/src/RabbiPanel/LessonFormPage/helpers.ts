import type { LessonVenueInput, RabbiCreateLessonRequest, RabbiLessonResponse } from '@torabarabim/common';

import type { SelectedCity } from '~/components/CitySelect/models';
import * as placePickerConsts from '~/components/PlacePicker/consts';
import type { LessonVenueFormState } from '~/components/PlacePicker/models';

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
  venue: { kind: 'address', name: '', street: '', floor: '' },
  audience: undefined,
});

// The place arm carries its own city on `venue.place`, so `city` stays
// unset for a place-backed lesson: `PlacePicker` reads the locked city
// straight off the place, never through `CitySelect`.
const venueFromLesson = (lesson: RabbiLessonResponse): LessonVenueFormState =>
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

export const lessonToFormState = (lesson: RabbiLessonResponse): LessonFormState => ({
  title: lesson.title ?? '',
  recurrenceKind: lesson.recurrence.kind,
  weekdays: lesson.recurrence.kind === 'weekly' ? lesson.recurrence.weekdays : [],
  date: lesson.recurrence.kind === 'once' ? lesson.recurrence.date : '',
  startTime: lesson.startTime,
  durationMinutes: String(lesson.durationMinutes),
  city: lesson.venue.kind === 'address' ? { id: String(lesson.venue.cityCode), name: lesson.venue.cityName } : undefined,
  venue: venueFromLesson(lesson),
  audience: lesson.audience,
});

// The live preview card's city line: a chosen place carries its own city,
// never through `form.city`, which only holds a value for the free-text arm.
export const previewCityName = (form: LessonFormState): string | undefined =>
  form.venue.kind === 'place' ? form.venue.place.city : form.city?.name;

// A static heading per mode, not derived from the lesson's own title
// (design doc, section 5: the mockup's edit screen reads "עריכת שיעור",
// never the lesson's name).
export const pageHeading = (isEditing: boolean): string => (isEditing ? consts.EDIT_HEADING : consts.NEW_HEADING);

export const validateLessonForm = (form: LessonFormState): LessonFormErrors => {
  const errors: LessonFormErrors = {};

  // A chosen place is always a complete, valid venue on its own; only the
  // free-text arm needs a city and a filled-in name and street.
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

// Assumes the form already passed validation, so `audience` is known
// present, and `city` is present whenever `venue` is still the address arm.
// No `rabbiId` in the payload: the server infers the owner from the session
// (`RabbiCreateLessonRequest = Omit<Lesson, 'id' | 'rabbiId'>`).
export const buildLessonPayload = (form: LessonFormState): RabbiCreateLessonRequest => {
  if (!form.audience) {
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
    venue,
    audience: form.audience,
    recurrence: form.recurrenceKind === 'weekly' ? { kind: 'weekly', weekdays: form.weekdays } : { kind: 'once', date: form.date },
    startTime: form.startTime,
    durationMinutes: Number(form.durationMinutes),
  };
};
