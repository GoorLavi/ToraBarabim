import { useQuery } from '@tanstack/react-query';
import type { AdminDedication } from '@torabarabim/common';

import { AdminApiError, fetchAdminDedications } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS, MAX_ADMIN_PAGE_SIZE } from '~/AdminPanel/consts';

export type AdminDedicationsListState =
  | { status: 'pending' }
  | { status: 'error'; error: AdminApiError; retry: () => void }
  | { status: 'success'; items: AdminDedication[]; total: number };

export const useAdminDedicationsList = (): AdminDedicationsListState => {
  const filters = { pageSize: MAX_ADMIN_PAGE_SIZE };
  const dedicationsQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.dedications(filters),
    queryFn: () => fetchAdminDedications(filters),
  });

  if (dedicationsQuery.isPending) return { status: 'pending' };
  if (dedicationsQuery.error instanceof AdminApiError) {
    return { status: 'error', error: dedicationsQuery.error, retry: () => void dedicationsQuery.refetch() };
  }
  if (!dedicationsQuery.data) return { status: 'pending' };

  return { status: 'success', items: dedicationsQuery.data.items, total: dedicationsQuery.data.total };
};
