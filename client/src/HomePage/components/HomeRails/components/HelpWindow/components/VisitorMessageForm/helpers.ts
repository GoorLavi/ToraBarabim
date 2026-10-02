import type { VisitorMessageDraft } from '~/HomePage/components/HomeRails/models';
import { isIsraeliMobilePhone } from '~/helpers';

import { FIELD_ERRORS } from './consts';
import type { VisitorMessageFormErrors } from './models';

// A pure read of the draft, never stored: the form derives what to show
// from this and from which fields have been flagged by a submit.
export const validateDraft = (draft: VisitorMessageDraft): VisitorMessageFormErrors => {
  const errors: VisitorMessageFormErrors = {};
  if (!draft.name.trim()) errors.name = FIELD_ERRORS.name;
  if (!isIsraeliMobilePhone(draft.phone)) errors.phone = FIELD_ERRORS.phone;
  if (!draft.message.trim()) errors.message = FIELD_ERRORS.message;
  return errors;
};
