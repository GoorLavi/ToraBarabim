import { useQuery } from '@tanstack/react-query';

import { AdminApiError, fetchAdminCourses } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS, MAX_ADMIN_PAGE_SIZE } from '~/AdminPanel/consts';

import type { AdminCoursesListState, AdminCourseStatusFilter } from './models';

// One request: unlike the lesson list, a course's own response already
// carries its teacher (`PanelCourseTeacher`), so there is no separate rabbi
// list to join in memory. `status` goes straight to the server (`open | full
// | closed`, `"all"` sending none), which both filters and sorts ("ההרשמה
// פתוחה" first by nearest opening date, "תפוסה מלאה" and "ההרשמה נסגרה"
// after it): paging would be wrong if this page re-sorted or re-filtered a
// single page of results on its own.
export const useAdminCoursesList = (search: string, statusFilter: AdminCourseStatusFilter, rabbiId: string | undefined): AdminCoursesListState => {
  const status = statusFilter === 'all' ? undefined : statusFilter;
  const query = useQuery({
    queryKey: ADMIN_QUERY_KEYS.courses({ q: search || undefined, status, rabbiId, pageSize: MAX_ADMIN_PAGE_SIZE }),
    queryFn: () => fetchAdminCourses({ q: search || undefined, status, rabbiId, pageSize: MAX_ADMIN_PAGE_SIZE }),
  });

  if (query.error instanceof AdminApiError) return { status: 'error', error: query.error, retry: () => void query.refetch() };
  if (!query.data) return { status: 'pending' };

  return { status: 'success', rows: query.data.items, total: query.data.total };
};
