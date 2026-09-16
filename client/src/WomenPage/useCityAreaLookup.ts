import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { CityDetailResponse } from '@torabarabim/common';

import type { SelectedCity } from '~/hooks/models';

import { fetchCities, fetchCityDetail, WomenPageApiError } from './api';
import { WOMEN_PAGE_QUERY_KEYS, WOMEN_PAGE_RETRY_LIMIT } from './consts';

// /women has no per-city detail call of its own (unlike the city page,
// which already knows its own area from its route's slug): finding the
// area to widen the empty-with-city state to, with a real Hebrew name and
// not just the bare `Area` enum, means two hops. First the name search
// (`GET /v1/cities?q=`) matched back to the selected id, the only way to
// recover the city's slug from the `{id, name}` the header's URL state
// carries; then `GET /v1/cities/:slug`, which is the one place `areaName`
// exists on the wire (no client-side Area-to-Hebrew map). Lazy, only once
// the empty-with-city state is reached. The first hop missing resolves to
// `undefined`, same as never finding the city at all; a thrown error from
// either hop leaves the query `isError`, except a 404 (a genuinely missing
// city, mirrors CityPage/useCityDetail.ts), which never retries.
export const useCityAreaLookup = (
  city: SelectedCity | undefined,
  enabled: boolean,
): UseQueryResult<CityDetailResponse | undefined, WomenPageApiError> =>
  useQuery({
    queryKey: WOMEN_PAGE_QUERY_KEYS.cityLookup(city?.id ?? ''),
    queryFn: async ({ signal }) => {
      if (!city) return undefined;
      const searchResult = await fetchCities(city.name, signal);
      const match = searchResult.items.find((item) => item.id === city.id);
      if (!match) return undefined;
      return fetchCityDetail(match.slug, signal);
    },
    enabled: enabled && Boolean(city),
    retry: (failureCount, error) => error.status !== 404 && failureCount < WOMEN_PAGE_RETRY_LIMIT,
  });
