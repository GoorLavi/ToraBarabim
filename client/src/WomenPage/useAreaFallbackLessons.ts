import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Area, LessonSearchResponse } from '@torabarabim/common';

import { fetchWomenLessons, WomenPageApiError } from './api';
import { AREA_FALLBACK_PAGE_SIZE, WOMEN_PAGE_QUERY_KEYS, WOMEN_PAGE_RETRY_LIMIT } from './consts';
import type { WomenLessonsRange } from './models';

// Only fetched once useCityAreaLookup resolves to a real area: never fired
// speculatively (mirrors CityPage/useAreaLessons.ts). Shares the exact
// window the main list itself uses (WomenPage.tsx's own `resolveWindow`
// call), the same helper, not a second copy.
export const useAreaFallbackLessons = (
  area: Area | undefined,
  range: WomenLessonsRange,
  enabled: boolean,
): UseQueryResult<LessonSearchResponse, WomenPageApiError> =>
  useQuery({
    queryKey: WOMEN_PAGE_QUERY_KEYS.areaLessons(area, range),
    queryFn: ({ signal }) => fetchWomenLessons({ area, from: range.from, to: range.to, pageSize: AREA_FALLBACK_PAGE_SIZE }, signal),
    enabled: enabled && Boolean(area),
    retry: WOMEN_PAGE_RETRY_LIMIT,
  });
