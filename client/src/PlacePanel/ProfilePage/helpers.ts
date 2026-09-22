import type { PlaceProfileResponse } from '@torabarabim/common';

import * as photoPickerConsts from '~/components/PhotoPicker/consts';

import * as consts from './consts';
import type { ProfileFormErrors, ProfileFormState } from './models';

export const formStateFromProfile = (profile: PlaceProfileResponse): ProfileFormState => ({
  name: profile.name,
  street: profile.street,
  floor: profile.floor ?? '',
  existingFloor: profile.floor,
  city: { id: String(profile.cityCode), name: profile.cityName },
});

export const validateProfileForm = (form: ProfileFormState): ProfileFormErrors => {
  const errors: ProfileFormErrors = {};
  if (!form.name.trim()) errors.name = consts.REQUIRED_NAME_ERROR;
  if (!form.street.trim()) errors.street = consts.REQUIRED_STREET_ERROR;
  if (!form.city) errors.city = consts.REQUIRED_CITY_ERROR;
  return errors;
};

// An update omits a key to mean "leave as is" and sends `null` to mean
// "clear" (`common/src/place-portal.ts`, `UpdatePlaceProfileRequest`),
// mirroring `RabbiPanel/ProfilePage/helpers.ts`'s `nullableTextField`
// exactly: only `floor` on this form is nullable.
export const nullableTextField = (currentValue: string, existingValue: string | undefined): string | null | undefined => {
  const trimmed = currentValue.trim();
  if (trimmed) return trimmed;
  return existingValue === undefined ? undefined : null;
};

// Matches `PHOTO_HELP_TYPE`'s "up to 5MB" (`components/PhotoPicker/consts.ts`):
// a client-side check ahead of the upload, not a substitute for the server's
// own validation, mirroring `RabbiPanel/ProfilePage/helpers.ts`'s
// `validatePhotoFile`.
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png'];

const readImageDimensions = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`failed to read image dimensions for ${file.name}`));
    };
    image.src = objectUrl;
  });

// Beyond type and size, a place's photo has to clear the floor the server
// enforces, so this reads the file's real pixel dimensions before ever
// uploading it. Async, unlike the rabbi panel's synchronous counterpart, for
// exactly that reason. It no longer checks the ratio: `PhotoPicker`'s crop
// step is what produces this file and it is always exactly 16:9, so a ratio
// test here could only ever fail on a file the person had no way to send.
export const validatePlacePhotoFile = async (file: File): Promise<string | undefined> => {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) return photoPickerConsts.UNSUPPORTED_TYPE_ERROR;
  if (file.size > MAX_PHOTO_BYTES) return photoPickerConsts.TOO_LARGE_ERROR;

  const { width, height } = await readImageDimensions(file);
  if (width < consts.MIN_WIDTH_PX || height < consts.MIN_HEIGHT_PX) {
    return consts.PHOTO_INVALID_ERROR;
  }

  return undefined;
};
