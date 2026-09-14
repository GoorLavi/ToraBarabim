import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Area, LessonSearchResponse } from '@torabarabim/common';

import { AreaPageApiError, fetchLessons } from './api';
import { AREA_PAGE_QUERY_KEYS, AREA_PAGE_RETRY_LIMIT } from './consts';

// `GET /v1/lessons?area=` takes the enum, never the slug, so this cannot
// start until useAreaDetail resolves and hands back `area` (mirrors
// CityPage/useCityLessons.ts). `pageSize` grows on "load more": one bigger
// request, not a second page merged in client-side (consts.ts,
// AREA_LESSONS_PAGE_SIZE).
export const useAreaLessons = (
  area: Area | undefined,
  pageSize: number,
): UseQueryResult<LessonSearchResponse, AreaPageApiError> =>
  useQuery({
    queryKey: AREA_PAGE_QUERY_KEYS.lessons(area, pageSize),
    queryFn: ({ signal }) => fetchLessons({ area, pageSize }, signal),
    enabled: Boolean(area),
    retry: (failureCount) => failureCount < AREA_PAGE_RETRY_LIMIT,
  });
