import type { LessonPlace } from '@torabarabim/common';

import * as parentConsts from '~/RabbiPanel/UpcomingPage/consts';
import type { UpcomingOccurrence } from '~/RabbiPanel/UpcomingPage/models';

import type { MoveFormErrors, MoveFormState } from './models';

export const initialMoveFormState = (occurrence: UpcomingOccurrence): MoveFormState => ({
  startTime: occurrence.startTime,
  placeOverrideEnabled: false,
  city: undefined,
  placeName: '',
  street: '',
});

export const validateMoveForm = (form: MoveFormState): MoveFormErrors => {
  const errors: MoveFormErrors = {};

  if (!form.startTime) errors.startTime = parentConsts.REQUIRED_START_TIME_ERROR;

  if (form.placeOverrideEnabled) {
    if (!form.city) errors.city = parentConsts.REQUIRED_CITY_ERROR;
    if (!form.placeName.trim()) errors.placeName = parentConsts.REQUIRED_PLACE_NAME_ERROR;
    if (!form.street.trim()) errors.street = parentConsts.REQUIRED_STREET_ERROR;
  }

  return errors;
};

// Undefined means "no override": the occurrence falls back to the
// lesson's own place. Assumes the form already passed validation, so
// `form.city` is known present whenever the toggle is on.
export const buildMovePlace = (form: MoveFormState): LessonPlace | undefined => {
  if (!form.placeOverrideEnabled || !form.city) return undefined;
  return { name: form.placeName.trim(), street: form.street.trim(), cityCode: Number(form.city.id) };
};
