import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { LessonSearchResponse } from '@torabarabim/common';

import { fetchLessons, RabbiPageApiError } from './api';
import { RABBI_PAGE_QUERY_KEYS, RABBI_PAGE_RETRY_LIMIT } from './consts';

// Runs alongside useRabbiDetail, never after it: both need only the
// rabbiId from the route, so TanStack Query fires them together the moment
// the page mounts (design spec, "Two calls, and they run together").
export const useRabbiLessons = (rabbiId: string): UseQueryResult<LessonSearchResponse, RabbiPageApiError> =>
  useQuery({
    queryKey: RABBI_PAGE_QUERY_KEYS.lessons(rabbiId),
    queryFn: ({ signal }) => fetchLessons({ rabbiId }, signal),
    enabled: rabbiId.length > 0,
    retry: (failureCount) => failureCount < RABBI_PAGE_RETRY_LIMIT,
  });
