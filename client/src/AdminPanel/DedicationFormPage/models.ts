import type { CreateDedicationRequest, DedicationHonorific, DedicationType, HonoredGender } from '@torabarabim/common';

export interface DedicationFormPageProps {
  className?: string;
}

// The honorific and the gender are two independent stored fields
// (common/src/dedication.ts): neither is ever derived from the other
// anywhere this state is read or written.
export interface DedicationFormState {
  type: DedicationType;
  honoredName: string;
  honorific: DedicationHonorific | undefined;
  // Undefined until the admin actually picks one: a default would print בן
  // or בת nobody chose, exactly the guess this feature's split from
  // `honorific` exists to prevent.
  honoredGender: HonoredGender | undefined;
  parentName: string;
  donorFamilyName: string;
  closingLineEnabled: boolean;
  startsOn: string;
  endsOn: string;
}

// Keyed by the request body's own field names, so a server `AdminApiError`'s
// flattened `details.fieldErrors` (api.ts) can be merged in without a second
// name for the same field.
export type DedicationFormErrors = Partial<Record<keyof CreateDedicationRequest, string>>;
