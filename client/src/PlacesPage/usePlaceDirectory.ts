import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Place } from '@torabarabim/common';

import { fetchPlaceDirectory, PlacesPageApiError } from './api';
import { PLACES_QUERY_KEYS } from './consts';
import { sortPlaces } from './helpers';

// GET /v1/places already returns every active place, unfiltered and
// unpaged (server/src/service/place/place.ts): unlike RabbisPage there is
// no page loop to run, the whole directory loads in one request.
export const usePlaceDirectory = (): UseQueryResult<Place[], PlacesPageApiError> =>
  useQuery({
    queryKey: PLACES_QUERY_KEYS.directory(),
    queryFn: async ({ signal }) => sortPlaces((await fetchPlaceDirectory(signal)).items),
  });
