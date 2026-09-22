import type { AdminPlaceResponse } from '@torabarabim/common';

import * as consts from './consts';
import type { PlaceFormErrors, PlaceFormState } from './models';

export const pageHeading = (form: PlaceFormState): string => form.name.trim() || consts.NEW_PLACE_HEADING;

export const validatePlaceForm = (form: PlaceFormState): PlaceFormErrors => {
  const errors: PlaceFormErrors = {};
  if (!form.name.trim()) errors.name = consts.REQUIRED_NAME_ERROR;
  if (!form.city) errors.city = consts.REQUIRED_CITY_ERROR;
  if (!form.street.trim()) errors.street = consts.REQUIRED_STREET_ERROR;
  return errors;
};

export const placeToFormState = (place: AdminPlaceResponse): PlaceFormState => ({
  name: place.name,
  city: { id: String(place.cityCode), name: place.cityName },
  street: place.street,
  floor: place.floor ?? '',
  existingFloor: place.floor,
  photoFile: undefined,
  existingPhotoUrl: place.photoUrl,
  isActive: place.isActive,
});
