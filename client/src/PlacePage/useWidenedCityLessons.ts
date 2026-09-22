import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Area, LessonSearchResponse } from '@torabarabim/common';

import { fetchCityDetail, fetchLessons, PlacePageApiError } from './api';
import { PLACE_PAGE_QUERY_KEYS, PLACE_PAGE_RETRY_LIMIT, WIDENED_CITY_LESSONS_PAGE_SIZE } from './consts';

// The city's own lessons, bundled with its area's label and slug: both come
// off the same city-detail hop this widening already makes to resolve the
// numeric city code, so carrying them costs no further request and lets the
// page widen a second time, to the area, without fetching the city detail
// again (PlacePage.tsx, useWidenedAreaLessons.ts).
export interface WidenedCityLessonsResult {
  lessons: LessonSearchResponse;
  area: Area;
  areaName: string;
  areaSlug: string;
}

// Only fetched once the place's own lessons resolve to an empty list
// (design spec, "the empty state widens... to the city"): never fired
// speculatively alongside the place's own detail or lessons calls. The
// place record carries its city's slug but not the numeric code
// GET /v1/lessons's `city` filter needs (common/src/venue.ts, Place), so
// this resolves the code first and only then asks for the city's own
// lessons: two network hops inside one query function, mirroring
// WomenPage/useCityAreaLookup.ts's own two-hop shape, rather than a second
// hook and a second loading state.
export const useWidenedCityLessons = (
  citySlug: string | undefined,
  enabled: boolean,
): UseQueryResult<WidenedCityLessonsResult, PlacePageApiError> =>
  useQuery({
    queryKey: PLACE_PAGE_QUERY_KEYS.widenedCityLessons(citySlug ?? ''),
    queryFn: async ({ signal }) => {
      const city = await fetchCityDetail(citySlug ?? '', signal);
      const lessons = await fetchLessons({ city: city.id, pageSize: WIDENED_CITY_LESSONS_PAGE_SIZE }, signal);
      return { lessons, area: city.area, areaName: city.areaName, areaSlug: city.areaSlug };
    },
    enabled: enabled && Boolean(citySlug),
    retry: (failureCount) => failureCount < PLACE_PAGE_RETRY_LIMIT,
  });
