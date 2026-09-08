import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { LessonSearchResponse } from '@torabarabim/common';

import { CityPageApiError, fetchLessons } from './api';
import { CITY_PAGE_QUERY_KEYS, CITY_PAGE_RETRY_LIMIT } from './consts';

// `GET /v1/lessons?city=` takes the numeric code, never the name, so this
// cannot start until useCityDetail resolves and hands back `cityCode`
// (design spec, "the whole reason this page needs a spec rather than a
// paraphrase"). `pageSize` grows on "load more": one bigger request, not a
// second page merged in client-side (consts.ts, CITY_LESSONS_PAGE_SIZE).
export const useCityLessons = (
  cityCode: string | undefined,
  pageSize: number,
): UseQueryResult<LessonSearchResponse, CityPageApiError> =>
  useQuery({
    queryKey: CITY_PAGE_QUERY_KEYS.lessons(cityCode ?? '', pageSize),
    queryFn: ({ signal }) => fetchLessons({ city: cityCode, pageSize }, signal),
    enabled: Boolean(cityCode),
    retry: (failureCount) => failureCount < CITY_PAGE_RETRY_LIMIT,
  });
