import { useQuery } from '@tanstack/react-query';
import type { Place } from '@torabarabim/common';

import { fetchPlaces } from './api';
import { PLACE_PICKER_QUERY_KEYS } from './consts';

const normalize = (value: string): string => value.trim().toLowerCase();

// The whole active-place list is fetched once (it is small and curated,
// per `GET /v1/places`'s own contract) and matched client-side against the
// name and the street, so typing in the popover never fires a request.
export const usePlaceSearch = (query: string): Place[] => {
  const result = useQuery({ queryKey: PLACE_PICKER_QUERY_KEYS.all(), queryFn: fetchPlaces });
  const items = result.data?.items ?? [];

  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return items;
  return items.filter((place) => normalize(place.name).includes(normalizedQuery) || normalize(place.street).includes(normalizedQuery));
};
