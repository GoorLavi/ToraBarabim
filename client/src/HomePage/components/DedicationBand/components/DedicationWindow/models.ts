import type { DedicationType } from '@torabarabim/common';

export interface DedicationWindowProps {
  className?: string;
  // Which band opened the window: the window's own content never varies by
  // it, only the `dedicationWindowOpen`/`dedicationContactClick` analytics
  // this carries along (analytics/consts.ts).
  bandType: DedicationType;
  onDismiss: () => void;
}
