import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { AdminApiError, fetchAdminRabbis } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS, MAX_ADMIN_PAGE_SIZE } from '~/AdminPanel/consts';

import { SEARCH_DEBOUNCE_MS } from './consts';
import type { AdminRabbisListState } from './models';

export const useAdminRabbisList = (search: string): AdminRabbisListState => {
  const trimmedSearch = search.trim();
  const [debouncedSearch, setDebouncedSearch] = useState(trimmedSearch);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(trimmedSearch), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [trimmedSearch]);

  const filters = { q: debouncedSearch || undefined, pageSize: MAX_ADMIN_PAGE_SIZE };
  const rabbisQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.rabbis(filters),
    queryFn: () => fetchAdminRabbis(filters),
  });
  const retry = (): void => {
    void rabbisQuery.refetch();
  };

  if (rabbisQuery.isPending) return { status: 'pending' };

  if (rabbisQuery.error instanceof AdminApiError) return { status: 'error', error: rabbisQuery.error, retry };
  if (!rabbisQuery.data) return { status: 'pending' };

  return { status: 'success', rows: rabbisQuery.data.items, total: rabbisQuery.data.total, appliedSearch: debouncedSearch };
};
