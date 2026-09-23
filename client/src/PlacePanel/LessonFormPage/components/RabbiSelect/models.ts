import type { Rabbi } from '@torabarabim/common';

export interface RabbiSelectProps {
  className?: string;
  rabbi: Rabbi | undefined;
  onSelectRabbi: (rabbi: Rabbi) => void;
  errorMessage: string | undefined;
}

export interface RabbiSearchResults {
  items: Rabbi[];
  isPending: boolean;
  isError: boolean;
}
