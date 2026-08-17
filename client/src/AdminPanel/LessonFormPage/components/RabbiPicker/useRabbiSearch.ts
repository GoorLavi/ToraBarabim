import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Rabbi } from '@torabarabim/common';

import { fetchAdminRabbis } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS, MAX_ADMIN_PAGE_SIZE } from '~/AdminPanel/consts';

const DEBOUNCE_MS = 250;

export interface RabbiSearchResults {
  items: Rabbi[];
  isPending: boolean;
}

export const useRabbiSearch = (query: string): RabbiSearchResults => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  const trimmed = debouncedQuery.trim();
  const filters = { q: trimmed || undefined, pageSize: MAX_ADMIN_PAGE_SIZE };
  const result = useQuery({
    queryKey: ADMIN_QUERY_KEYS.rabbis(filters),
    queryFn: () => fetchAdminRabbis(filters),
  });

  return { items: result.data?.items ?? [], isPending: result.isPending };
};
