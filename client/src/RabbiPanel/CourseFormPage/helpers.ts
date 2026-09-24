import type { CourseFieldsRequest, CourseResponse, CourseTopic, LessonVenueInput } from '@torabarabim/common';

import type { SelectedCity } from '~/components/CitySelect/models';
import * as placePickerConsts from '~/components/PlacePicker/consts';
import type { LessonVenueFormState } from '~/components/PlacePicker/models';

import * as consts from './consts';
import type { CourseFormErrors, CourseFormState, CourseTopicFormValue } from './models';

export const initialFormState = (): CourseFormState => ({
  name: '',
  cycle: '',
  description: '',
  topic: { kind: 'none' },
  cover: undefined,
  openingDate: '',
  weeks: '',
  sessions: '',
  hours: '',
  joinableAfterOpening: false,
  city: undefined,
  venue: { kind: 'address', name: '', street: '', floor: '' },
  audience: undefined,
  contactPhone: '',
  priceShekels: '',
});

const venueFromCourse = (course: CourseResponse): LessonVenueFormState =>
  course.venue.kind === 'place'
    ? {
        kind: 'place',
        place: {
          id: course.venue.placeId,
          slug: course.venue.slug,
          name: course.venue.name,
          street: course.venue.street,
          floor: course.venue.floor,
          city: course.venue.city,
          citySlug: course.venue.citySlug,
          area: course.venue.area,
          isActive: true,
        },
      }
    : { kind: 'address', name: course.venue.name, street: course.venue.street, floor: course.venue.floor ?? '' };

const topicFormValue = (topic: CourseTopic | undefined): CourseTopicFormValue => {
  if (!topic) return { kind: 'none' };
  if (topic.value === 'other') return { kind: 'other', otherText: topic.otherText };
  return { kind: 'set', value: topic.value };
};

export const courseToFormState = (course: CourseResponse): CourseFormState => ({
  name: course.name,
  cycle: course.cycle !== undefined ? String(course.cycle) : '',
  description: course.description,
  topic: topicFormValue(course.topic),
  cover: undefined,
  openingDate: course.openingDate,
  weeks: String(course.weeks),
  sessions: String(course.sessions),
  hours: course.hours !== undefined ? String(course.hours) : '',
  joinableAfterOpening: course.joinableAfterOpening,
  city: course.venue.kind === 'address' ? { id: String(course.venue.cityCode), name: course.venue.cityName } : undefined,
  venue: venueFromCourse(course),
  audience: course.audience,
  contactPhone: course.contactPhone,
  priceShekels: course.priceShekels !== undefined ? String(course.priceShekels) : '',
});

export const pageHeading = (isEditing: boolean): string => (isEditing ? consts.EDIT_HEADING : consts.NEW_HEADING);

export const validateCourseForm = (form: CourseFormState, isCreating: boolean): CourseFormErrors => {
  const errors: CourseFormErrors = {};

  if (!form.name.trim()) errors.name = consts.REQUIRED_NAME_ERROR;
  if (!form.description.trim()) errors.description = consts.REQUIRED_DESCRIPTION_ERROR;
  if (form.topic.kind === 'other' && !form.topic.otherText.trim()) errors.topicOther = consts.REQUIRED_TOPIC_OTHER_ERROR;
  if (form.cycle.trim() && (!Number.isInteger(Number(form.cycle)) || Number(form.cycle) <= 0)) errors.cycle = consts.INVALID_CYCLE_ERROR;

  if (isCreating && !form.cover) errors.cover = consts.REQUIRED_COVER_ERROR;

  if (!form.openingDate) errors.openingDate = consts.REQUIRED_OPENING_DATE_ERROR;

  const weeks = Number(form.weeks);
  if (!Number.isInteger(weeks) || weeks <= 0) errors.weeks = consts.REQUIRED_WEEKS_ERROR;

  const sessions = Number(form.sessions);
  if (!Number.isInteger(sessions) || sessions <= 0) errors.sessions = consts.REQUIRED_SESSIONS_ERROR;

  if (form.hours.trim() && (!Number.isInteger(Number(form.hours)) || Number(form.hours) <= 0)) errors.hours = consts.INVALID_HOURS_ERROR;

  if (form.venue.kind === 'address') {
    if (!form.city) errors.city = placePickerConsts.REQUIRED_CITY_ERROR;
    if (!form.venue.name.trim()) errors.addressName = placePickerConsts.REQUIRED_ADDRESS_NAME_ERROR;
    if (!form.venue.street.trim()) errors.street = placePickerConsts.REQUIRED_STREET_ERROR;
  }

  if (!form.audience) errors.audience = consts.REQUIRED_AUDIENCE_ERROR;

  if (!form.contactPhone.trim()) errors.contactPhone = consts.REQUIRED_CONTACT_PHONE_ERROR;

  if (form.priceShekels.trim() && (!Number.isInteger(Number(form.priceShekels)) || Number(form.priceShekels) <= 0)) {
    errors.priceShekels = consts.INVALID_PRICE_ERROR;
  }

  return errors;
};

const buildTopic = (topic: CourseTopicFormValue): CourseTopic | undefined => {
  if (topic.kind === 'none') return undefined;
  if (topic.kind === 'other') return { value: 'other', otherText: topic.otherText.trim() };
  return { value: topic.value };
};

// Assumes the form already passed `validateCourseForm`, the same contract
// `buildLessonPayload` keeps with its own validator.
export const buildCoursePayload = (form: CourseFormState): CourseFieldsRequest => {
  if (!form.audience) throw new Error('buildCoursePayload called before the form passed validation');
  if (form.venue.kind === 'address' && !form.city) throw new Error('buildCoursePayload called before the form passed validation');

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
    name: form.name.trim(),
    cycle: form.cycle.trim() ? Number(form.cycle) : undefined,
    description: form.description.trim(),
    openingDate: form.openingDate,
    weeks: Number(form.weeks),
    sessions: Number(form.sessions),
    hours: form.hours.trim() ? Number(form.hours) : undefined,
    venue,
    audience: form.audience,
    topic: buildTopic(form.topic),
    joinableAfterOpening: form.joinableAfterOpening,
    contactPhone: form.contactPhone.trim(),
    priceShekels: form.priceShekels.trim() ? Number(form.priceShekels) : undefined,
  };
};
