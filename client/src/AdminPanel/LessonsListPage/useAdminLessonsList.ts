import { useQuery } from '@tanstack/react-query';

import { AdminApiError, fetchAdminLessons, fetchAdminPlaces, fetchAdminRabbis } from '~/AdminPanel/api';
import type { SelectedCity } from '~/AdminPanel/components/CitySelect/models';
import { ADMIN_QUERY_KEYS, MAX_ADMIN_PAGE_SIZE } from '~/AdminPanel/consts';

import { joinLessonRows, sortRowsBySoonest } from './helpers';
import type { AdminLessonRow } from './models';

export type AdminLessonsListState =
  | { status: 'pending' }
  | { status: 'error'; error: AdminApiError; retry: () => void }
  | { status: 'success'; rows: AdminLessonRow[]; total: number; loadedCount: number };

// Three independent queries, fetched together rather than one awaiting the
// next (root CLAUDE.md, Async and data access). `LessonResponse` only
// carries `rabbiId`/`placeId` on the wire, so rabbis and places are loaded
// once each (capped at `MAX_ADMIN_PAGE_SIZE`, see the report for this
// slice) and joined onto each lesson in memory, never queried per row.
export const useAdminLessonsList = (city: SelectedCity | undefined): AdminLessonsListState => {
  const lessonsQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.lessons({ cityId: city?.id, pageSize: MAX_ADMIN_PAGE_SIZE }),
    queryFn: () => fetchAdminLessons({ cityId: city?.id, pageSize: MAX_ADMIN_PAGE_SIZE }),
  });
  const rabbisQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.rabbis({ pageSize: MAX_ADMIN_PAGE_SIZE }),
    queryFn: () => fetchAdminRabbis({ pageSize: MAX_ADMIN_PAGE_SIZE }),
  });
  const placesQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.places({ pageSize: MAX_ADMIN_PAGE_SIZE }),
    queryFn: () => fetchAdminPlaces({ pageSize: MAX_ADMIN_PAGE_SIZE }),
  });

  const retry = (): void => {
    void lessonsQuery.refetch();
    void rabbisQuery.refetch();
    void placesQuery.refetch();
  };

  if (lessonsQuery.isPending || rabbisQuery.isPending || placesQuery.isPending) return { status: 'pending' };

  const firstError = lessonsQuery.error ?? rabbisQuery.error ?? placesQuery.error;
  if (firstError instanceof AdminApiError) return { status: 'error', error: firstError, retry };
  if (!lessonsQuery.data || !rabbisQuery.data || !placesQuery.data) return { status: 'pending' };

  const rows = sortRowsBySoonest(joinLessonRows(lessonsQuery.data.items, rabbisQuery.data.items, placesQuery.data.items));

  return { status: 'success', rows, total: lessonsQuery.data.total, loadedCount: lessonsQuery.data.items.length };
};
