import type { RabbiProfileResponse } from '@torabarabim/common';

import * as photoPickerConsts from '~/components/PhotoPicker/consts';

import * as consts from './consts';
import type { ProfileFormErrors, ProfileFormState } from './models';

export const formStateFromProfile = (profile: RabbiProfileResponse): ProfileFormState => ({
  name: profile.name,
  title: profile.title ?? '',
  bio: profile.bio ?? '',
  existingTitle: profile.title,
  existingBio: profile.bio,
});

export const validateProfileForm = (form: ProfileFormState): ProfileFormErrors => {
  const errors: ProfileFormErrors = {};
  if (!form.name.trim()) errors.name = consts.REQUIRED_NAME_ERROR;
  return errors;
};

// An update omits a key to mean "leave as is" and sends `null` to mean
// "clear" (`common/src/rabbi-portal.ts`, `UpdateRabbiProfileRequest`),
// which an empty string alone cannot distinguish: this also needs the
// value as it was loaded from the server. Mirrors the admin rabbi form's
// `nullableTextField`.
export const nullableTextField = (currentValue: string, existingValue: string | undefined): string | null | undefined => {
  const trimmed = currentValue.trim();
  if (trimmed) return trimmed;
  return existingValue === undefined ? undefined : null;
};

// Matches `PHOTO_HELP_TYPE`'s "up to 5MB" (`components/PhotoPicker/consts.ts`):
// a client-side check ahead of the upload, not a substitute for the
// server's own validation.
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png'];

export const validatePhotoFile = (file: File): string | undefined => {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) return photoPickerConsts.UNSUPPORTED_TYPE_ERROR;
  if (file.size > MAX_PHOTO_BYTES) return photoPickerConsts.TOO_LARGE_ERROR;
  return undefined;
};
