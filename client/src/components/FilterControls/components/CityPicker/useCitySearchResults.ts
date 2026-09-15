import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { fetchCities } from './api';
import { CITY_PICKER_QUERY_KEYS } from './consts';
import type { CitySearchViewState } from './models';

const DEBOUNCE_MS = 250;

// Debounced so typing a city name does not fire a request per keystroke.
// Gated on the raw (undebounced) query being non-empty, not the debounced
// one: otherwise the few hundred milliseconds between a keystroke and the
// debounced value catching up would read as `idle` instead of `loading`.
// `placeholderData: keepPreviousData` keeps the last successful result set
// while a new query is in flight, so the caller can dim the old list
// instead of flashing a loading line on every keystroke.
export const useCitySearchResults = (rawQuery: string): CitySearchViewState => {
  const trimmed = rawQuery.trim();
  const [debouncedQuery, setDebouncedQuery] = useState(trimmed);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(trimmed), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [trimmed]);

  const result = useQuery({
    queryKey: CITY_PICKER_QUERY_KEYS.search(debouncedQuery),
    queryFn: () => fetchCities(debouncedQuery),
    enabled: debouncedQuery.length > 0,
    placeholderData: keepPreviousData,
  });

  if (trimmed.length === 0) return { kind: 'idle' };
  if (result.isError) return { kind: 'error', retry: () => void result.refetch() };
  if (!result.data) return { kind: 'loading' };
  if (result.data.items.length === 0) return { kind: 'empty' };
  return { kind: 'results', items: result.data.items, isFetching: result.isFetching };
};
