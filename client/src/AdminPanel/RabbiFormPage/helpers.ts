import type { RabbiResponse } from '@torabarabim/common';

import { rabbiDisplayName } from '~/helpers';

import * as consts from './consts';
import type { RabbiFormErrors, RabbiFormState } from './models';

export const pageHeading = (form: RabbiFormState): string =>
  form.name ? rabbiDisplayName({ name: form.name, honorific: form.honorific }) : consts.NEW_RABBI_HEADING;

// Name is the only field required to save. A rabbi may be created before
// their photo exists; the public fallback (design-system.md, "Rabbi image
// fallback") covers the card until one is added.
export const validateRabbiForm = (form: RabbiFormState): RabbiFormErrors => {
  const errors: RabbiFormErrors = {};
  if (!form.name.trim()) errors.name = consts.REQUIRED_NAME_ERROR;
  return errors;
};

// An update omits a key to mean "leave as is" and sends `null` to mean
// "clear" (`common/src/admin.ts`, `UpdateRabbiRequest`): the two are
// indistinguishable from an empty string alone, so this also needs the
// value as it was loaded from the server. A field that was always blank
// and still is has nothing to clear, so it stays omitted rather than
// sending a needless `null`.
export const nullableTextField = (currentValue: string, existingValue: string | undefined): string | null | undefined => {
  const trimmed = currentValue.trim();
  if (trimmed) return trimmed;
  return existingValue === undefined ? undefined : null;
};

const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png'];

// A basic type/size check before upload, not a substitute for the
// server's own validation (client/CLAUDE.md: no in-browser crop tool in
// this slice, so nothing enforces the 800x1200 / 2:3 requirements here).
export const validatePhotoFile = (file: File): string | undefined => {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) return consts.UNSUPPORTED_TYPE_CLIENT_ERROR;
  if (file.size > consts.CLIENT_MAX_PHOTO_BYTES) return consts.TOO_LARGE_CLIENT_ERROR;
  return undefined;
};

// Backs edit mode's cancel confirm-sheet: whether the draft differs from
// the record as loaded, so cancelling with nothing to lose skips the
// confirmation. `honorific` is excluded, it cannot change after creation
// (`HONORIFIC_READONLY_NOTE`), so it is never part of what "discard" would
// discard.
export const isRabbiFormDirty = (form: RabbiFormState, existingRabbi: RabbiResponse): boolean =>
  form.name.trim() !== existingRabbi.name ||
  form.title.trim() !== (existingRabbi.title ?? '') ||
  form.bio.trim() !== (existingRabbi.bio ?? '') ||
  form.prominence !== existingRabbi.prominence ||
  form.photoFile !== undefined;
