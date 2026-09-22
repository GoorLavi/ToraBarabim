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
