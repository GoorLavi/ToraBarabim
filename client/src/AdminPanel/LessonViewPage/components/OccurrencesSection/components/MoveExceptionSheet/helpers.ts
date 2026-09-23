import type { LessonAddress } from '@torabarabim/common';

import * as parentConsts from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/consts';
import type { OccurrenceRowData } from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/models';

import type { MoveFormErrors, MoveFormState } from './models';

// The place fields always start blank, never prefilled from a date that is
// already moved: `row.cityName`/`row.placeName` are resolved display text
// with no city id behind them (`LessonOccurrence.venue` carries no
// `cityCode`), so there is nothing valid to prefill `CitySelect` with. The
// rabbi panel's own move sheet has the same gap; see the report for this
// slice.
export const initialMoveFormState = (row: OccurrenceRowData): MoveFormState => ({
  startTime: row.startTime,
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

// Undefined means "no override": the occurrence falls back to the lesson's
// own place. Assumes the form already passed validation, so `form.city` is
// known present whenever the toggle is on.
export const buildMovePlace = (form: MoveFormState): LessonAddress | undefined => {
  if (!form.placeOverrideEnabled || !form.city) return undefined;
  return { name: form.placeName.trim(), street: form.street.trim(), cityCode: Number(form.city.id) };
};
