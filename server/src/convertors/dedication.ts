import type { Dedication, DedicationText } from '@torabarabim/common';

import { composeDedicationText } from '../service/dedication/text';
import type { ResolvedDedication } from '../service/dedication/models';

export const toDedicationText = (fields: ResolvedDedication): DedicationText => composeDedicationText(fields);

export const toDedication = (record: ResolvedDedication): Dedication => ({
  id: record.id,
  text: toDedicationText(record),
});
