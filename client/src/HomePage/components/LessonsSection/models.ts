import type { LessonOccurrence, LessonSearchResponse } from '@torabarabim/common';

import type { HomeApiError } from '~/HomePage/api';
import type { SelectedCity } from '~/hooks/models';

// The slice of TanStack Query's `UseQueryResult` this component actually
// reads. Keeping it narrow means a story can hand this component a plain
// object instead of a real query client.
export interface LessonSearchQueryState {
  isPending: boolean;
  isError: boolean;
  data: LessonSearchResponse | undefined;
  error: HomeApiError | null;
  refetch: () => void;
  dataUpdatedAt: number;
}

export interface LessonsSectionProps {
  className?: string;
  query: LessonSearchQueryState;
  // The same key `useLessonSearch` fetches with (`HOME_QUERY_KEYS.lessons`),
  // built once in `HomePage.tsx` so this component and the query it renders
  // can never diverge on what counts as "a new result set".
  resultSetKey: unknown;
  // Whether a date chip (or the calendar) is actually selected. When it
  // is not, there is no date axis to widen along, and the section renders
  // a flat, dateless list instead of day sections (design-system.md, "Every
  // data screen has three states").
  hasDateFilter: boolean;
  targetDate: string;
  city: SelectedCity | undefined;
  searchQuery: string;
  // The way back out of a dateless, empty result: clears city and search
  // query and returns to the unfiltered rows (design review, Group A).
  onClearFilters: () => void;
}

export interface DaySection {
  date: string;
  items: LessonOccurrence[];
}
