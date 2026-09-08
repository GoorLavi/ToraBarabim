import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { LessonSearchResponse } from '@torabarabim/common';

import { fetchLessons, RabbiPageApiError } from './api';
import { NATIONWIDE_LESSONS_PAGE_SIZE, RABBI_PAGE_QUERY_KEYS, RABBI_PAGE_RETRY_LIMIT } from './consts';

// Only fetched once the rabbi's own lesson count is known to be zero
// (design spec, "the empty state widens... rather than a bare 'clear the
// filter'"): never fired speculatively alongside the other two calls.
export const useNationwideLessons = (enabled: boolean): UseQueryResult<LessonSearchResponse, RabbiPageApiError> =>
  useQuery({
    queryKey: RABBI_PAGE_QUERY_KEYS.nationwideLessons(),
    queryFn: ({ signal }) => fetchLessons({ pageSize: NATIONWIDE_LESSONS_PAGE_SIZE }, signal),
    enabled,
    retry: (failureCount) => failureCount < RABBI_PAGE_RETRY_LIMIT,
  });
