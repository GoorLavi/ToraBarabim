import { useQuery } from '@tanstack/react-query';
import type { AdminLessonListItem } from '@torabarabim/common';

import { AdminApiError, fetchAdminLessons } from '~/AdminPanel/api';
import type { SelectedCity } from '~/components/CitySelect/models';
import { ADMIN_QUERY_KEYS, MAX_ADMIN_PAGE_SIZE } from '~/AdminPanel/consts';

import { sortRowsBySoonest } from './helpers';

export type AdminLessonsListState =
  | { status: 'pending' }
  | { status: 'error'; error: AdminApiError; retry: () => void }
  | { status: 'success'; rows: AdminLessonListItem[]; total: number; loadedCount: number };

export const useAdminLessonsList = (city: SelectedCity | undefined, rabbiId: string | undefined): AdminLessonsListState => {
  const filters = { cityId: city?.id, rabbiId, pageSize: MAX_ADMIN_PAGE_SIZE };
  const lessonsQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.lessons(filters),
    queryFn: () => fetchAdminLessons(filters),
  });

  if (lessonsQuery.isPending) return { status: 'pending' };

  if (lessonsQuery.error instanceof AdminApiError) return { status: 'error', error: lessonsQuery.error, retry: () => void lessonsQuery.refetch() };
  if (!lessonsQuery.data) return { status: 'pending' };

  return { status: 'success', rows: sortRowsBySoonest(lessonsQuery.data.items), total: lessonsQuery.data.total, loadedCount: lessonsQuery.data.items.length };
};
