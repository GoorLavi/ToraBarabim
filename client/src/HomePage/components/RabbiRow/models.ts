import type { Rabbi } from '@torabarabim/common';

export interface RabbiRowProps {
  className?: string;
  rabbis: Rabbi[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export type { Rabbi };
