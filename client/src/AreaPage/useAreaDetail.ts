import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AreaDetailResponse } from '@torabarabim/common';

import { AreaPageApiError, fetchAreaDetail } from './api';
import { AREA_PAGE_QUERY_KEYS, AREA_PAGE_RETRY_LIMIT } from './consts';

export const useAreaDetail = (areaSlug: string): UseQueryResult<AreaDetailResponse, AreaPageApiError> =>
  useQuery({
    queryKey: AREA_PAGE_QUERY_KEYS.detail(areaSlug),
    queryFn: ({ signal }) => fetchAreaDetail(areaSlug, signal),
    enabled: areaSlug.length > 0,
    // A 404 is a fact about the slug, not a transient failure: retrying it
    // only delays reaching the not-found screen.
    retry: (failureCount, error) => error.status !== 404 && failureCount < AREA_PAGE_RETRY_LIMIT,
  });
