import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { RabbiDetailResponse } from '@torabarabim/common';

import { fetchRabbiDetail, RabbiPageApiError } from './api';
import { RABBI_PAGE_QUERY_KEYS, RABBI_PAGE_RETRY_LIMIT } from './consts';

export const useRabbiDetail = (rabbiId: string): UseQueryResult<RabbiDetailResponse, RabbiPageApiError> =>
  useQuery({
    queryKey: RABBI_PAGE_QUERY_KEYS.detail(rabbiId),
    queryFn: ({ signal }) => fetchRabbiDetail(rabbiId, signal),
    enabled: rabbiId.length > 0,
    // A 404 is a fact about the rabbi, not a transient failure: retrying it
    // only delays reaching the not-found screen.
    retry: (failureCount, error) => error.status !== 404 && failureCount < RABBI_PAGE_RETRY_LIMIT,
  });
