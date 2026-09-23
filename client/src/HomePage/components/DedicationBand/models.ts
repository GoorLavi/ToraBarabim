import type { DedicationGroup } from '@torabarabim/common';

import type { DedicationVariant } from '~/components/DedicationUnit/models';

export interface DedicationBandProps {
  className?: string;
  // `undefined` before HomePage's post-mount draw has run and when the
  // pool is genuinely empty; both render as nothing (helpers.ts,
  // design-system.md, dedication States).
  group: DedicationGroup | undefined;
  variant: DedicationVariant;
}
