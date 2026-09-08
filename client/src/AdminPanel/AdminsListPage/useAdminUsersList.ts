import { useQuery } from '@tanstack/react-query';
import type { AdminUserListItem } from '@torabarabim/common';

import { AdminApiError, fetchAdminUsers } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS, MAX_ADMIN_PAGE_SIZE } from '~/AdminPanel/consts';

export type AdminUsersListState =
  | { status: 'pending' }
  | { status: 'error'; error: AdminApiError; retry: () => void }
  | { status: 'success'; items: AdminUserListItem[]; total: number };

export const useAdminUsersList = (): AdminUsersListState => {
  const filters = { pageSize: MAX_ADMIN_PAGE_SIZE };
  const query = useQuery({
    queryKey: ADMIN_QUERY_KEYS.adminUsers(filters),
    queryFn: () => fetchAdminUsers(filters),
  });

  if (query.isPending) return { status: 'pending' };
  if (query.error instanceof AdminApiError) return { status: 'error', error: query.error, retry: () => void query.refetch() };
  if (!query.data) return { status: 'pending' };

  return { status: 'success', items: query.data.items, total: query.data.total };
};
