import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { City } from '@torabarabim/common';

import { fetchAdminCities } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

const DEBOUNCE_MS = 250;

export interface AdminCitySearchResults {
  items: City[];
  isPending: boolean;
  isError: boolean;
}

// Same debounced-search shape as HomePage's `useCitySearchResults` (client
// CLAUDE.md: reuse the pattern; see AdminPanel/api.ts for why the fetch
// function itself is a small, deliberate duplicate rather than a shared
// import across sibling features).
export const useAdminCitySearch = (query: string): AdminCitySearchResults => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  const trimmed = debouncedQuery.trim();
  const result = useQuery({
    queryKey: ADMIN_QUERY_KEYS.cities(trimmed),
    queryFn: () => fetchAdminCities(trimmed),
    enabled: trimmed.length > 0,
  });

  return {
    items: result.data?.items ?? [],
    isPending: trimmed.length > 0 && result.isPending,
    isError: trimmed.length > 0 && result.isError,
  };
};
