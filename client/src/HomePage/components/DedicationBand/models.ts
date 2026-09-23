import type { DedicationGroup } from '@torabarabim/common';

import type { DedicationVariant } from '~/components/DedicationUnit/models';

export interface DedicationBandProps {
  className?: string;
  // Independent of `group`, on purpose: this is the only way to tell "the
  // per-load draw has not run yet" (reserve the band's own block size)
  // apart from "the pool is genuinely empty" (render nothing at all), and
  // the plan treats those two differently (design-system.md, dedication
  // States and "The draw").
  hasDedications: boolean;
  // `undefined` until HomePage's post-mount draw has run.
  group: DedicationGroup | undefined;
  variant: DedicationVariant;
}

export interface DedicationBandDrawnProps {
  className?: string;
  group: DedicationGroup;
  variant: DedicationVariant;
}
