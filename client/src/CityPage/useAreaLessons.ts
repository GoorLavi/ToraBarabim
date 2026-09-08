import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Area, LessonSearchResponse } from '@torabarabim/common';

import { CityPageApiError, fetchLessons } from './api';
import { AREA_LESSONS_PAGE_SIZE, CITY_PAGE_QUERY_KEYS, CITY_PAGE_RETRY_LIMIT } from './consts';

// Only fetched once useCityLessons resolves to an empty list: never fired
// speculatively alongside the other two calls (design spec, "Only when
// call 2 comes back empty").
export const useAreaLessons = (area: Area | undefined, enabled: boolean): UseQueryResult<LessonSearchResponse, CityPageApiError> =>
  useQuery({
    queryKey: CITY_PAGE_QUERY_KEYS.areaLessons(area),
    queryFn: ({ signal }) => fetchLessons({ area, pageSize: AREA_LESSONS_PAGE_SIZE }, signal),
    enabled: enabled && Boolean(area),
    retry: (failureCount) => failureCount < CITY_PAGE_RETRY_LIMIT,
  });
