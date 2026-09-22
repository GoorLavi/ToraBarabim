import type { DedicationGroup, HomeResponse } from '@torabarabim/common';

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
  // The one draw HomePage made for this page load, prop-drilled by one
  // level rather than read again here: a second draw would put two
  // different type groups on one page (design-system.md, dedication "The
  // draw"). `undefined` before the draw has run and when the pool is empty.
  dedicationGroup: DedicationGroup | undefined;
}
