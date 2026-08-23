import { useQuery } from '@tanstack/react-query';

import { AdminApiError, fetchAdminLessons, fetchAdminRabbis } from '~/AdminPanel/api';
import type { SelectedCity } from '~/components/CitySelect/models';
import { ADMIN_QUERY_KEYS, MAX_ADMIN_PAGE_SIZE } from '~/AdminPanel/consts';

import { joinLessonRows, sortRowsBySoonest } from './helpers';
import type { AdminLessonRow } from './models';

export type AdminLessonsListState =
  | { status: 'pending' }
  | { status: 'error'; error: AdminApiError; retry: () => void }
  | { status: 'success'; rows: AdminLessonRow[]; total: number; loadedCount: number };

// Two independent queries, fetched together rather than one awaiting the
// next (root CLAUDE.md, Async and data access). `LessonResponse` carries
// its own venue, so only rabbis need a separate lookup (capped at
// `MAX_ADMIN_PAGE_SIZE`, see the report for this slice), joined onto each
// lesson in memory, never queried per row.
export const useAdminLessonsList = (city: SelectedCity | undefined): AdminLessonsListState => {
  const lessonsQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.lessons({ cityId: city?.id, pageSize: MAX_ADMIN_PAGE_SIZE }),
    queryFn: () => fetchAdminLessons({ cityId: city?.id, pageSize: MAX_ADMIN_PAGE_SIZE }),
  });
  const rabbisQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.rabbis({ pageSize: MAX_ADMIN_PAGE_SIZE }),
    queryFn: () => fetchAdminRabbis({ pageSize: MAX_ADMIN_PAGE_SIZE }),
  });

  const retry = (): void => {
    void lessonsQuery.refetch();
    void rabbisQuery.refetch();
  };

  if (lessonsQuery.isPending || rabbisQuery.isPending) return { status: 'pending' };

  const firstError = lessonsQuery.error ?? rabbisQuery.error;
  if (firstError instanceof AdminApiError) return { status: 'error', error: firstError, retry };
  if (!lessonsQuery.data || !rabbisQuery.data) return { status: 'pending' };

  const rows = sortRowsBySoonest(joinLessonRows(lessonsQuery.data.items, rabbisQuery.data.items));

  return { status: 'success', rows, total: lessonsQuery.data.total, loadedCount: lessonsQuery.data.items.length };
};
