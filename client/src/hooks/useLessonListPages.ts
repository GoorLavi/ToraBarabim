import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import type { LessonSearchResponse } from '@torabarabim/common';

import type { LessonListPagesResult } from './models';

// Shared by CityPage and WomenPage: "load more" pages through `page` at a
// fixed page size, never a growing `pageSize`, and never past the server's
// own `MAX_PAGE_SIZE`. `fetchPage` closes over its own filters and fixed
// page size; this hook only owns the accumulation. `keepPrevious` is per
// caller, since only a caller whose filters can change while open (a city,
// a date, a search term) has a placeholder state worth opting into.
export const useLessonListPages = <TError>(
  queryKey: readonly unknown[],
  fetchPage: (page: number, signal?: AbortSignal) => Promise<LessonSearchResponse>,
  enabled: boolean,
  retry: number,
  keepPrevious: boolean,
): LessonListPagesResult<TError> =>
  useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) => fetchPage(pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const fetchedCount = allPages.reduce((sum, page) => sum + page.items.length, 0);
      return fetchedCount < lastPage.total ? lastPage.page + 1 : undefined;
    },
    placeholderData: keepPrevious ? keepPreviousData : undefined,
    enabled,
    retry,
  });
