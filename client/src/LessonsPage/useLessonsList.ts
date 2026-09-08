import { useInfiniteQuery } from '@tanstack/react-query';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';
import type { LessonSearchResponse } from '@torabarabim/common';

import { fetchLessons, LessonsApiError } from './api';
import { LESSONS_DATA_RETRY_LIMIT, LESSONS_QUERY_KEYS } from './consts';
import type { LessonsFilters } from './models';

export type LessonsListQueryResult = UseInfiniteQueryResult<{ pages: LessonSearchResponse[] }, LessonsApiError>;

// A date-filtered view is a single fixed window fetch, never a load-more
// (05-lessons.md, "Phone, filtered and empty"): only the complete,
// unfiltered-by-date list ever has a next page.
export const useLessonsList = (filters: LessonsFilters, hasDateFilter: boolean): LessonsListQueryResult =>
  useInfiniteQuery({
    queryKey: LESSONS_QUERY_KEYS.list(filters),
    queryFn: ({ pageParam }) => fetchLessons(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (hasDateFilter) return undefined;
      const fetchedCount = allPages.reduce((sum, page) => sum + page.items.length, 0);
      return fetchedCount < lastPage.total ? lastPage.page + 1 : undefined;
    },
    retry: LESSONS_DATA_RETRY_LIMIT,
  });
