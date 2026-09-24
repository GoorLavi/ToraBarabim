import type { DedicationGroup } from '@torabarabim/common';

import type { DedicationVariant } from '~/components/DedicationUnit/models';

export interface DedicationBandProps {
  className?: string;
  // Absent or empty renders nothing at all: each band is fixed to one
  // `DedicationType`, and a type with no active dedications is not shown.
  group: DedicationGroup | undefined;
  variant: DedicationVariant;
}

export interface DedicationBandTrackProps {
  className?: string;
  group: DedicationGroup;
  variant: DedicationVariant;
}
