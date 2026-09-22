import type { DedicationText } from '@torabarabim/common';

import {
  DEDICATION_CLOSING_LINE,
  DEDICATION_DONOR_CREDIT_PREFIX,
  DEDICATION_FORMULA_BY_TYPE,
  DEDICATION_HONORIFIC_SUFFIX,
  DEDICATION_PARENT_PARTICLE,
} from './consts';
import type { DedicationFields } from './models';

const NBSP = ' ';

// The closing line's suffix (ז״ל / ע״ה / הי״ד) binds to the name line, not
// to the parent line: a line consisting only of the father's name must
// never itself close with a suffix meant for the deceased, which would
// print that a living man died.
export const composeDedicationText = (fields: DedicationFields): DedicationText => {
  const nameLine = fields.honorific
    ? `${fields.honoredName}${NBSP}${DEDICATION_HONORIFIC_SUFFIX[fields.honorific]}`
    : fields.honoredName;

  const parentLine = fields.parentName
    ? `${DEDICATION_PARENT_PARTICLE[fields.honoredGender]}${NBSP}${fields.parentName}`
    : undefined;

  const closingLine = fields.type === 'memorial' && fields.closingLineEnabled ? DEDICATION_CLOSING_LINE : undefined;

  const donorCreditLine = fields.donorFamilyName ? `${DEDICATION_DONOR_CREDIT_PREFIX}${fields.donorFamilyName}` : undefined;

  return {
    formulaLine: DEDICATION_FORMULA_BY_TYPE[fields.type],
    nameLine,
    parentLine,
    closingLine,
    donorCreditLine,
  };
};
