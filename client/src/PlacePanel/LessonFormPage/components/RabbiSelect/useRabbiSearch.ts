import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Rabbi } from '@torabarabim/common';

import { fetchRabbiDirectoryPage } from '~/PlacePanel/api';
import { PLACE_QUERY_KEYS } from '~/PlacePanel/consts';

// Matches `AdminPanel/LessonFormPage/components/RabbiPicker/useRabbiSearch.ts`'s
// own 250ms debounce.
const DEBOUNCE_MS = 250;

export interface RabbiSearchResults {
  items: Rabbi[];
  isPending: boolean;
  isError: boolean;
}

// Both audience scopes are queried and merged, same as `useRabbiDirectory`,
// so a rabbanit stays reachable through the women's scope.
export const useRabbiSearch = (query: string): RabbiSearchResults => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  const trimmed = debouncedQuery.trim();
  const q = trimmed || undefined;

  const general = useQuery({
    queryKey: PLACE_QUERY_KEYS.rabbiDirectory('general', q),
    queryFn: () => fetchRabbiDirectoryPage('general', q),
  });
  const women = useQuery({
    queryKey: PLACE_QUERY_KEYS.rabbiDirectory('women', q),
    queryFn: () => fetchRabbiDirectoryPage('women', q),
  });

  return {
    items: [...(general.data?.items ?? []), ...(women.data?.items ?? [])],
    isPending: general.isPending || women.isPending,
    isError: general.isError || women.isError,
  };
};
