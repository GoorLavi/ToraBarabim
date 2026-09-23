import { useQuery } from '@tanstack/react-query';

import { fetchPlaces } from './api';
import { PLACE_PICKER_QUERY_KEYS } from './consts';
import type { PlaceSearchResults } from './models';

const normalize = (value: string): string => value.trim().toLowerCase();

// The whole active-place list is fetched once (it is small and curated,
// per `GET /v1/places`'s own contract) and matched client-side against the
// name and the street, so typing in the popover never fires a request.
export const usePlaceSearch = (query: string): PlaceSearchResults => {
  const result = useQuery({ queryKey: PLACE_PICKER_QUERY_KEYS.all(), queryFn: fetchPlaces });
  const items = result.data?.items ?? [];

  const normalizedQuery = normalize(query);
  const filtered = normalizedQuery
    ? items.filter((place) => normalize(place.name).includes(normalizedQuery) || normalize(place.street).includes(normalizedQuery))
    : items;

  return { items: filtered, isPending: result.isPending, isError: result.isError };
};
