import type { Rabbi } from '@torabarabim/common';

export interface RabbiPickerProps {
  className?: string;
  rabbi: Rabbi | undefined;
  onSelectRabbi: (rabbi: Rabbi) => void;
  errorMessage: string | undefined;
}
