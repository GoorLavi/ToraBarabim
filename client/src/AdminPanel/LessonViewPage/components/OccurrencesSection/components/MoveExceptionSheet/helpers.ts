import type { LessonPlace, ResolvedLessonPlace } from '@torabarabim/common';

import * as parentConsts from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/consts';
import type { OccurrenceRowData } from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/models';

import type { MoveFormErrors, MoveFormState } from './models';

// Move only ever opens on a scheduled row (`OccurrenceRow.tsx` never shows
// the Move action on a cancelled one), so an existing exception here is
// always 'modified'; this narrows past the 'cancelled' branch, which has
// no place at all. Resolved, unlike `LessonPlace`: it carries `cityName`
// alongside `cityCode`, which is what makes prefilling `CitySelect`
// possible below.
const existingPlace = (row: OccurrenceRowData): ResolvedLessonPlace | undefined =>
  row.existingException?.kind === 'modified' ? row.existingException.place : undefined;

// Prefills from `row.existingException`, the resolved exception record
// (`LessonExceptionResponse`), not from the occurrence's own resolved
// `place`: the occurrence's place carries a resolved city name with no
// `cityCode` behind it, so it cannot feed `CitySelect`. The exception's own
// `place` is a `ResolvedLessonPlace`, which carries both, so a date that
// already has a place override reopens with that override showing, not a
// blank toggle.
export const initialMoveFormState = (row: OccurrenceRowData): MoveFormState => {
  const place = existingPlace(row);
  return {
    startTime: row.startTime,
    placeOverrideEnabled: place !== undefined,
    city: place ? { id: String(place.cityCode), name: place.cityName } : undefined,
    placeName: place?.name ?? '',
    street: place?.street ?? '',
    floor: place?.floor ?? '',
  };
};

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
export const buildMovePlace = (form: MoveFormState): LessonPlace | undefined => {
  if (!form.placeOverrideEnabled || !form.city) return undefined;
  return { name: form.placeName.trim(), street: form.street.trim(), floor: form.floor.trim() || undefined, cityCode: Number(form.city.id) };
};
