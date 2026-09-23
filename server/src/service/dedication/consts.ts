import type { DedicationHonorific, DedicationType, HonoredGender } from '@torabarabim/common';

// Non-breaking space and Hebrew punctuation gershayim, used only to build
// the constants below. Never an ASCII quote: `״` is U+05F4, not `"`.
const NBSP = ' ';
const GERSHAYIM = '״';

// Hebrew product copy, one closed record per dedication type, mirroring
// how `service/home/consts.ts` holds the home row titles (0012). The
// non-breaking spaces inside are load bearing, not defensive: at 280 the
// name line wraps as a matter of course, so a formula must never split
// across a wrap either. `healing` also carries a trailing NBSP after `של`
// so the preposition never separates from the name line that follows it.
export const DEDICATION_FORMULA_BY_TYPE: Record<DedicationType, string> = {
  memorial: `לעילוי${NBSP}נשמת`,
  healing: `לרפואה${NBSP}שלמה${NBSP}של${NBSP}`,
  success: 'להצלחת',
};

export const DEDICATION_HONORIFIC_SUFFIX: Record<DedicationHonorific, string> = {
  zl: `ז${GERSHAYIM}ל`,
  ah: `ע${GERSHAYIM}ה`,
  hyd: `הי${GERSHAYIM}ד`,
};

// The only gender-driven token: `בן` versus `בת` on the parent line.
export const DEDICATION_PARENT_PARTICLE: Record<HonoredGender, string> = {
  male: 'בן',
  female: 'בת',
};

export const DEDICATION_CLOSING_LINE = `תנצב${GERSHAYIM}ה`;

export const DEDICATION_DONOR_CREDIT_PREFIX = `תרומת משפחת${NBSP}`;
