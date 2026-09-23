import type { RefObject } from 'react';
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import type { AudienceFilter, LessonSearchResponse } from '@torabarabim/common';

// Every chip resolves to one day, never a range: the ratified empty state
// widens forward from that single day (HomePage/consts.ts,
// LESSON_WINDOW_DAYS). 'all' means no date filter at all, the default, and
// is kept out of the URL so a clean URL is the default state
// (useDateFilter.ts).
export type DateFilterOption = 'all' | 'today' | 'tomorrow' | 'shabbat' | 'custom';

export interface SelectedCity {
  id: string;
  name: string;
}

export interface AudienceFilterState {
  filter: AudienceFilter | undefined;
  selectFilter: (filter: AudienceFilter) => void;
  clearFilter: () => void;
}

export type LessonListPagesResult<TError> = UseInfiniteQueryResult<InfiniteData<LessonSearchResponse>, TError>;

export interface DismissPopoverOptions {
  isOpen: boolean;
  rootRef: RefObject<HTMLElement | null>;
  onDismiss: () => void;
  triggerRef?: RefObject<HTMLElement | null>;
}
