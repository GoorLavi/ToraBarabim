import { useQuery } from '@tanstack/react-query';
import type { AdminPlaceResponse } from '@torabarabim/common';

import { AdminApiError, fetchAdminPlaces } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS, MAX_ADMIN_PAGE_SIZE } from '~/AdminPanel/consts';

export type AdminPlacesListState =
  | { status: 'pending' }
  | { status: 'error'; error: AdminApiError; retry: () => void }
  | { status: 'success'; items: AdminPlaceResponse[]; total: number };

export const useAdminPlacesList = (search: string): AdminPlacesListState => {
  const filters = { q: search || undefined, pageSize: MAX_ADMIN_PAGE_SIZE };
  const query = useQuery({
    queryKey: ADMIN_QUERY_KEYS.places(filters),
    queryFn: () => fetchAdminPlaces(filters),
  });

  if (query.error instanceof AdminApiError) return { status: 'error', error: query.error, retry: () => void query.refetch() };
  if (query.isPending || !query.data) return { status: 'pending' };
  return { status: 'success', items: query.data.items, total: query.data.total };
};
