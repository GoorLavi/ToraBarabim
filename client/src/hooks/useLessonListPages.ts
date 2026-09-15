import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';
import type { LessonSearchResponse } from '@torabarabim/common';

export type LessonListPagesResult<TError> = UseInfiniteQueryResult<{ pages: LessonSearchResponse[] }, TError>;

// Shared by CityPage and WomenPage: "load more" asks for the next `page` of
// a fixed page size, never a bigger `pageSize` (the earlier shape both pages
// copied grew `pageSize` on every click, eventually past the server's own
// `MAX_PAGE_SIZE` and into a 400). `fetchPage` already has its filters and
// its fixed page size closed over; this hook only owns the accumulation.
// `placeholderData: keepPreviousData` so a filter change (a city, a date, a
// search term) keeps the previous page's cards up instead of blanking the
// screen while the new filter's first page loads; `isPlaceholderData` on
// the result is how a caller tells that in-flight state apart from a
// genuine empty result.
export const useLessonListPages = <TError>(
  queryKey: readonly unknown[],
  fetchPage: (page: number, signal?: AbortSignal) => Promise<LessonSearchResponse>,
  enabled: boolean,
  retry: number,
): LessonListPagesResult<TError> =>
  useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) => fetchPage(pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const fetchedCount = allPages.reduce((sum, page) => sum + page.items.length, 0);
      return fetchedCount < lastPage.total ? lastPage.page + 1 : undefined;
    },
    placeholderData: keepPreviousData,
    enabled,
    retry,
  });
