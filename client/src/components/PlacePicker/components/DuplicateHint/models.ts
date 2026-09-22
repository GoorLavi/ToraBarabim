import type { Place } from '@torabarabim/common';

export interface DuplicateHintProps {
  className?: string;
  place: Place;
  onConfirm: () => void;
  onDismiss: () => void;
}
