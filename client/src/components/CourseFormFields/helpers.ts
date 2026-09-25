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

// Everything a `CourseResponse` carries except its teacher, which each
// caller's own page resolves into its own form shape (the rabbi form has no
// teacher field at all; the admin form's own `TeacherPicker` reads
// `course.teacher` directly).
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

// The server's own contact-number shape (`^05\d{8}$`, `client/src/helpers.ts`'s
// own comment on `phoneToInternational`): a local Israeli mobile number,
// hand-mirrored here so a malformed number never reaches the request.
const ISRAELI_MOBILE_PHONE_PATTERN = /^05\d{8}$/;

// Strips spaces, dashes, and a leading international prefix the way the
// server does before validating, so "050-123-4567" and "+972501234567" both
// pass and both land on the wire in the same canonical local form.
export const normalizeIsraeliMobilePhone = (raw: string): string => {
  const stripped = raw.trim().replace(/[\s-]/g, '');
  if (stripped.startsWith('+972')) return `0${stripped.slice(4)}`;
  if (stripped.startsWith('972')) return `0${stripped.slice(3)}`;
  return stripped;
};

export const validateCourseForm = (form: CourseFormState, isCreating: boolean): CourseFormErrors => {
  const errors: CourseFormErrors = {};

  if (!form.name.trim()) errors.name = consts.REQUIRED_NAME_ERROR;
  else if (form.name.trim().length > consts.COURSE_NAME_MAX_LENGTH) errors.name = consts.NAME_TOO_LONG_ERROR;

  if (!form.description.trim()) errors.description = consts.REQUIRED_DESCRIPTION_ERROR;
  else if (form.description.trim().length > consts.COURSE_DESCRIPTION_MAX_LENGTH) errors.description = consts.DESCRIPTION_TOO_LONG_ERROR;

  if (form.topic.kind === 'other' && !form.topic.otherText.trim()) errors.topicOther = consts.REQUIRED_TOPIC_OTHER_ERROR;

  if (isCreating && !form.cover) errors.cover = consts.REQUIRED_COVER_ERROR;

  if (!form.openingDate) errors.openingDate = consts.REQUIRED_OPENING_DATE_ERROR;

  if (form.cycle.trim()) {
    const cycle = Number(form.cycle);
    if (!Number.isInteger(cycle) || cycle <= 0 || cycle > consts.COURSE_CYCLE_MAX) errors.cycle = consts.CYCLE_RANGE_ERROR;
  }

  const weeks = Number(form.weeks);
  if (!Number.isInteger(weeks) || weeks <= 0) errors.weeks = consts.REQUIRED_WEEKS_ERROR;
  else if (weeks > consts.COURSE_WEEKS_MAX) errors.weeks = consts.WEEKS_RANGE_ERROR;

  const sessions = Number(form.sessions);
  if (!Number.isInteger(sessions) || sessions <= 0) errors.sessions = consts.REQUIRED_SESSIONS_ERROR;
  else if (sessions > consts.COURSE_SESSIONS_MAX) errors.sessions = consts.SESSIONS_RANGE_ERROR;

  if (form.hours.trim()) {
    const hours = Number(form.hours);
    if (!Number.isInteger(hours) || hours <= 0 || hours > consts.COURSE_HOURS_MAX) errors.hours = consts.HOURS_RANGE_ERROR;
  }

  if (form.venue.kind === 'address') {
    if (!form.city) errors.city = placePickerConsts.REQUIRED_CITY_ERROR;
    if (!form.venue.name.trim()) errors.addressName = placePickerConsts.REQUIRED_ADDRESS_NAME_ERROR;
    if (!form.venue.street.trim()) errors.street = placePickerConsts.REQUIRED_STREET_ERROR;
  }

  if (!form.audience) errors.audience = consts.REQUIRED_AUDIENCE_ERROR;

  if (!ISRAELI_MOBILE_PHONE_PATTERN.test(normalizeIsraeliMobilePhone(form.contactPhone))) errors.contactPhone = consts.REQUIRED_CONTACT_PHONE_ERROR;

  if (form.priceShekels.trim()) {
    const price = Number(form.priceShekels);
    if (!Number.isInteger(price) || price <= 0) errors.priceShekels = consts.INVALID_PRICE_ERROR;
    else if (price > consts.COURSE_PRICE_MAX) errors.priceShekels = consts.PRICE_TOO_HIGH_ERROR;
  }

  return errors;
};

const buildTopic = (topic: CourseTopicFormValue): CourseTopic | undefined => {
  if (topic.kind === 'none') return undefined;
  if (topic.kind === 'other') return { value: 'other', otherText: topic.otherText.trim() };
  return { value: topic.value };
};

// Assumes the form already passed `validateCourseForm`. Never carries a
// teacher: the rabbi's create/update request has none on the wire at all,
// and the admin's own save hook spreads its own `teacher` onto this result.
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
    contactPhone: normalizeIsraeliMobilePhone(form.contactPhone),
    priceShekels: form.priceShekels.trim() ? Number(form.priceShekels) : undefined,
  };
};
