import type { AdminDedication, CreateDedicationRequest } from '@torabarabim/common';

import type { AdminValidationDetails } from '~/AdminPanel/api';

import * as consts from './consts';
import type { DedicationFormErrors, DedicationFormState } from './models';

export const emptyDedicationForm: DedicationFormState = {
  type: 'memorial',
  honoredName: '',
  honorific: undefined,
  honoredGender: 'male',
  parentName: '',
  donorFamilyName: '',
  closingLineEnabled: false,
  startsOn: '',
  endsOn: '',
};

export const dedicationFormFromExisting = (dedication: AdminDedication): DedicationFormState => ({
  type: dedication.type,
  honoredName: dedication.honoredName,
  honorific: dedication.honorific,
  honoredGender: dedication.honoredGender,
  parentName: dedication.parentName ?? '',
  donorFamilyName: dedication.donorFamilyName ?? '',
  closingLineEnabled: dedication.closingLineEnabled,
  startsOn: dedication.startsOn,
  endsOn: dedication.endsOn,
});

// Client-side checks for the fields a round trip should not be needed to
// catch. The server's own schema (server/src/service/admin-dedication/models.ts)
// is still the source of truth; this only saves the obviously-incomplete
// case a request.
export const validateDedicationForm = (form: DedicationFormState): DedicationFormErrors => {
  const errors: DedicationFormErrors = {};
  if (!form.honoredName.trim()) errors.honoredName = consts.REQUIRED_NAME_ERROR;
  if (!form.startsOn) errors.startsOn = consts.REQUIRED_STARTS_ON_ERROR;
  if (!form.endsOn) errors.endsOn = consts.REQUIRED_ENDS_ON_ERROR;
  if (form.startsOn && form.endsOn && form.endsOn < form.startsOn) errors.endsOn = consts.INVALID_WINDOW_ERROR;
  return errors;
};

// Flattens a server `AdminApiError.details` (zod's `flatten()` shape) onto
// this form's own field names, taking the first message per field. The
// request body's keys and `keyof CreateDedicationRequest` are the same
// names by construction, so no translation table is needed between them.
export const dedicationFormErrorsFromDetails = (details: AdminValidationDetails | undefined): DedicationFormErrors => {
  if (!details) return {};
  const errors: DedicationFormErrors = {};
  for (const [field, messages] of Object.entries(details.fieldErrors)) {
    const [firstMessage] = messages;
    if (firstMessage) errors[field as keyof CreateDedicationRequest] = firstMessage;
  }
  return errors;
};

export const buildDedicationRequest = (form: DedicationFormState): CreateDedicationRequest => ({
  type: form.type,
  honoredName: form.honoredName.trim(),
  honorific: form.honorific,
  honoredGender: form.honoredGender,
  parentName: form.parentName.trim() || undefined,
  donorFamilyName: form.donorFamilyName.trim() || undefined,
  // The checkbox is only ever shown for a memorial (consts.CLOSING_LINE_HELPER),
  // so a stale `true` left over from switching away from that type must
  // never reach the request even though the composer itself already guards
  // on `type === 'memorial'` (server/src/service/dedication/text.ts).
  closingLineEnabled: form.type === 'memorial' && form.closingLineEnabled,
  startsOn: form.startsOn,
  endsOn: form.endsOn,
});

export const pageHeading = (id: string | undefined): string => (id ? consts.EDIT_DEDICATION_HEADING : consts.NEW_DEDICATION_HEADING);
