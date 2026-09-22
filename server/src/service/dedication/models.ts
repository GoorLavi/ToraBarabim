import type { DedicationHonorific, DedicationType, HonoredGender } from '@torabarabim/common';

// The raw shape a dedication composes from, whether freshly read from a row
// (`listActive`) or typed live into the admin form's preview. Deliberately
// narrower than `AdminDedication` (`common/src/admin.ts`): nothing here is
// not needed to compose text, so no id, no window dates, no takedown state.
export interface DedicationFields {
  type: DedicationType;
  honoredName: string;
  honorific?: DedicationHonorific;
  honoredGender: HonoredGender;
  parentName?: string;
  donorFamilyName?: string;
  closingLineEnabled: boolean;
}

export interface ResolvedDedication extends DedicationFields {
  id: string;
}

export interface DedicationGroupResult {
  type: DedicationType;
  items: ResolvedDedication[];
}
