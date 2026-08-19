import type { HomeResponse } from '@torabarabim/common';

import type { HomeApiError } from '~/HomePage/api';

// The slice of TanStack Query's `UseQueryResult` this component actually
// reads, the same narrowing `LessonsSection` uses so a story can hand it a
// plain object instead of a real query client.
export interface HomeRowsQueryState {
  isPending: boolean;
  isError: boolean;
  data: HomeResponse | undefined;
  error: HomeApiError | null;
  refetch: () => void;
}

export interface HomeRailsProps {
  className?: string;
  query: HomeRowsQueryState;
}
