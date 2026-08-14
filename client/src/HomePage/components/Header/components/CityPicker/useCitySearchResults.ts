import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { City } from '@torabarabim/common';

import { fetchCities } from '~/HomePage/api';
import { HOME_QUERY_KEYS } from '~/HomePage/consts';

const DEBOUNCE_MS = 250;

export interface CitySearchResults {
  items: City[];
  isPending: boolean;
  isError: boolean;
}

// Debounced so typing a city name does not fire a request per keystroke.
export const useCitySearchResults = (query: string): CitySearchResults => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  const trimmed = debouncedQuery.trim();
  const result = useQuery({
    queryKey: HOME_QUERY_KEYS.cities(trimmed),
    queryFn: () => fetchCities(trimmed),
    enabled: trimmed.length > 0,
  });

  return {
    items: result.data?.items ?? [],
    isPending: trimmed.length > 0 && result.isPending,
    isError: trimmed.length > 0 && result.isError,
  };
};
