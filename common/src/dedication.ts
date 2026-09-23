export type DedicationType = 'memorial' | 'healing' | 'success';

// The suffix printed after the honoree's name: `zl` (ז״ל) most often for a
// man, `ah` (ע״ה) most often for a woman, `hyd` (הי״ד) for a victim of
// violence. `honoredGender` drives בן versus בת on the parent line and
// nothing else; the two fields are never derived from each other, so a
// female record carrying `zl` composes ז״ל exactly as written.
export type DedicationHonorific = 'zl' | 'ah' | 'hyd';

export type HonoredGender = 'male' | 'female';

// The four named segments a dedication renders, composed once on the
// server from stored fields (`server/src/service/dedication/text.ts`) and
// never assembled at the render seam. `parentLine`, `closingLine` and
// `donorCreditLine` are absent, not empty, when the field behind them is
// not set.
export interface DedicationText {
  formulaLine: string;
  nameLine: string;
  parentLine?: string;
  closingLine?: string;
  donorCreditLine?: string;
}

export interface Dedication {
  id: string;
  text: DedicationText;
}

// One type's drawn group: both home-page placements (the foot band and the
// between-rails band) show the same group on a given page load, never a
// mix of types.
export interface DedicationGroup {
  type: DedicationType;
  items: Dedication[];
}
