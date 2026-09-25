import { useQuery } from '@tanstack/react-query';

import { AdminApiError, fetchAdminCourses } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS, MAX_ADMIN_PAGE_SIZE } from '~/AdminPanel/consts';

import { matchesStatusFilter, sortCourseRows } from './helpers';
import type { AdminCoursesListState, AdminCourseStatusFilter } from './models';

// One request: unlike the lesson list, a course's own response already
// carries its teacher (`PanelCourseTeacher`), so there is no separate rabbi
// list to join in memory. `status` is never sent to the server (`models.ts`'s
// own comment): the whole page is fetched and every status bucket, `q`
// included, is narrowed here, consistent with the "fetch the whole list
// once" convention `MAX_ADMIN_PAGE_SIZE` already sets for admin lists.
export const useAdminCoursesList = (search: string, statusFilter: AdminCourseStatusFilter, rabbiId: string | undefined): AdminCoursesListState => {
  const query = useQuery({
    queryKey: ADMIN_QUERY_KEYS.courses({ q: search || undefined, rabbiId, pageSize: MAX_ADMIN_PAGE_SIZE }),
    queryFn: () => fetchAdminCourses({ q: search || undefined, rabbiId, pageSize: MAX_ADMIN_PAGE_SIZE }),
  });

  if (query.error instanceof AdminApiError) return { status: 'error', error: query.error, retry: () => void query.refetch() };
  if (!query.data) return { status: 'pending' };

  const rows = sortCourseRows(query.data.items.filter((course) => matchesStatusFilter(course, statusFilter)));
  return { status: 'success', rows, total: rows.length };
};
