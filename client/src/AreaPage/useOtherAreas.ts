import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AreaDirectoryResponse } from '@torabarabim/common';

import { AreaPageApiError, fetchAreaDirectory } from './api';
import { AREA_PAGE_QUERY_KEYS, AREA_PAGE_RETRY_LIMIT } from './consts';

// Only fetched once useAreaDetail resolves with no cities: the sideways
// widening for the genuinely empty area, never fired speculatively
// alongside the area's own detail call (mirrors CityPage/useAreaLessons.ts).
export const useOtherAreas = (enabled: boolean): UseQueryResult<AreaDirectoryResponse, AreaPageApiError> =>
  useQuery({
    queryKey: AREA_PAGE_QUERY_KEYS.otherAreas(),
    queryFn: ({ signal }) => fetchAreaDirectory(signal),
    enabled,
    retry: (failureCount) => failureCount < AREA_PAGE_RETRY_LIMIT,
  });
