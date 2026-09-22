import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Area, LessonSearchResponse } from '@torabarabim/common';

import { fetchLessons, PlacePageApiError } from './api';
import { PLACE_PAGE_QUERY_KEYS, PLACE_PAGE_RETRY_LIMIT, WIDENED_AREA_LESSONS_PAGE_SIZE } from './consts';

// The page's second widening step, only fired once the first one (to the
// city, useWidenedCityLessons.ts) resolves to an empty list too (design gate
// finding F2): mirrors CityPage/useAreaLessons.ts, one step later in this
// page's own cascade.
export const useWidenedAreaLessons = (area: Area | undefined, enabled: boolean): UseQueryResult<LessonSearchResponse, PlacePageApiError> =>
  useQuery({
    queryKey: PLACE_PAGE_QUERY_KEYS.widenedAreaLessons(area),
    queryFn: ({ signal }) => fetchLessons({ area, pageSize: WIDENED_AREA_LESSONS_PAGE_SIZE }, signal),
    enabled: enabled && Boolean(area),
    retry: (failureCount) => failureCount < PLACE_PAGE_RETRY_LIMIT,
  });
