import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { CityDetailResponse } from '@torabarabim/common';

import { CityPageApiError, fetchCityDetail } from './api';
import { CITY_PAGE_QUERY_KEYS, CITY_PAGE_RETRY_LIMIT } from './consts';

export const useCityDetail = (citySlug: string): UseQueryResult<CityDetailResponse, CityPageApiError> =>
  useQuery({
    queryKey: CITY_PAGE_QUERY_KEYS.detail(citySlug),
    queryFn: ({ signal }) => fetchCityDetail(citySlug, signal),
    enabled: citySlug.length > 0,
    // A 404 is a fact about the slug, not a transient failure: retrying it
    // only delays reaching the not-found screen.
    retry: (failureCount, error) => error.status !== 404 && failureCount < CITY_PAGE_RETRY_LIMIT,
  });
