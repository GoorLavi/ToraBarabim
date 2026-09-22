import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { PlaceDetailResponse } from '@torabarabim/common';

import { fetchPlaceDetail, PlacePageApiError } from './api';
import { PLACE_PAGE_QUERY_KEYS, PLACE_PAGE_RETRY_LIMIT } from './consts';

export const usePlaceDetail = (placeId: string): UseQueryResult<PlaceDetailResponse, PlacePageApiError> =>
  useQuery({
    queryKey: PLACE_PAGE_QUERY_KEYS.detail(placeId),
    queryFn: ({ signal }) => fetchPlaceDetail(placeId, signal),
    enabled: placeId.length > 0,
    // A 404 is a fact about the place, not a transient failure: retrying it
    // only delays reaching the not-found screen.
    retry: (failureCount, error) => error.status !== 404 && failureCount < PLACE_PAGE_RETRY_LIMIT,
  });
