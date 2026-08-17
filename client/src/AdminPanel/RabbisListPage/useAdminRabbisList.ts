import { useQuery } from '@tanstack/react-query';

import { AdminApiError, fetchAdminLessons, fetchAdminRabbis } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS, MAX_ADMIN_PAGE_SIZE } from '~/AdminPanel/consts';

import type { AdminRabbiRow } from './models';

export type AdminRabbisListState =
  | { status: 'pending' }
  | { status: 'error'; error: AdminApiError; retry: () => void }
  | { status: 'success'; rows: AdminRabbiRow[]; total: number };

// Two independent reads, joined in memory: `GET /v1/admin/rabbis` has no
// lesson count of its own, so the whole lesson list is fetched once
// (capped at `MAX_ADMIN_PAGE_SIZE`, undercounts beyond that; see the
// report for this slice) and counted per `rabbiId`.
export const useAdminRabbisList = (search: string): AdminRabbisListState => {
  const filters = { q: search || undefined, pageSize: MAX_ADMIN_PAGE_SIZE };
  const rabbisQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.rabbis(filters),
    queryFn: () => fetchAdminRabbis(filters),
  });
  const lessonsQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.lessons({ pageSize: MAX_ADMIN_PAGE_SIZE }),
    queryFn: () => fetchAdminLessons({ pageSize: MAX_ADMIN_PAGE_SIZE }),
  });

  const retry = (): void => {
    void rabbisQuery.refetch();
    void lessonsQuery.refetch();
  };

  if (rabbisQuery.isPending || lessonsQuery.isPending) return { status: 'pending' };

  const firstError = rabbisQuery.error ?? lessonsQuery.error;
  if (firstError instanceof AdminApiError) return { status: 'error', error: firstError, retry };
  if (!rabbisQuery.data || !lessonsQuery.data) return { status: 'pending' };

  const countByRabbiId = new Map<string, number>();
  for (const lesson of lessonsQuery.data.items) {
    countByRabbiId.set(lesson.rabbiId, (countByRabbiId.get(lesson.rabbiId) ?? 0) + 1);
  }

  const rows: AdminRabbiRow[] = rabbisQuery.data.items.map((rabbi) => ({ rabbi, lessonCount: countByRabbiId.get(rabbi.id) ?? 0 }));

  return { status: 'success', rows, total: rabbisQuery.data.total };
};
