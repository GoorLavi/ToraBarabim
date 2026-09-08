import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { CityDetailResponse } from '@torabarabim/common';

import { CityPageApiError, fetchCityDetail } from './api';
import { CITY_PAGE_QUERY_KEYS, CITY_PAGE_RETRY_LIMIT } from './consts';

export const useCityDetail = (cityName: string): UseQueryResult<CityDetailResponse, CityPageApiError> =>
  useQuery({
    queryKey: CITY_PAGE_QUERY_KEYS.detail(cityName),
    queryFn: ({ signal }) => fetchCityDetail(cityName, signal),
    enabled: cityName.length > 0,
    // A 404 is a fact about the name, not a transient failure: retrying it
    // only delays reaching the not-found screen.
    retry: (failureCount, error) => error.status !== 404 && failureCount < CITY_PAGE_RETRY_LIMIT,
  });
