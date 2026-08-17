import * as consts from './consts';
import type { RabbiFormErrors, RabbiFormState } from './models';

export const pageHeading = (form: RabbiFormState): string => form.name || consts.NEW_RABBI_HEADING;

// Both name and a photo are required to save, a UI-level rule stricter
// than `CreateRabbiRequest`'s wire type (`photoUrl` is optional there,
// since it is set through the separate photo-upload endpoint, not the
// create body): see the report for this slice.
export const validateRabbiForm = (form: RabbiFormState): RabbiFormErrors => {
  const errors: RabbiFormErrors = {};
  if (!form.name.trim()) errors.name = consts.REQUIRED_NAME_ERROR;
  if (!form.photoFile && !form.existingPhotoUrl) errors.photo = consts.REQUIRED_PHOTO_ERROR;
  return errors;
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
