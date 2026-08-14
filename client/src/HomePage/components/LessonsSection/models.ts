import type { LessonOccurrence, LessonSearchResponse } from '@torabarabim/common';

import type { HomeApiError } from '~/HomePage/api';
import type { SelectedCity } from '~/HomePage/models';

// The slice of TanStack Query's `UseQueryResult` this component actually
// reads. Keeping it narrow means a story can hand this component a plain
// object instead of a real query client.
export interface LessonSearchQueryState {
  isPending: boolean;
  isError: boolean;
  data: LessonSearchResponse | undefined;
  error: HomeApiError | null;
  refetch: () => void;
}

export interface LessonsSectionProps {
  className?: string;
  query: LessonSearchQueryState;
  targetDate: string;
  city: SelectedCity | undefined;
  searchQuery: string;
}

export interface DaySection {
  date: string;
  items: LessonOccurrence[];
}
