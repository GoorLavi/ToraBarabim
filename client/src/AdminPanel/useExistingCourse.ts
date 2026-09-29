import { useQuery } from '@tanstack/react-query';
import type { CourseResponse } from '@torabarabim/common';

import { AdminApiError, fetchAdminCourse } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export type ExistingCourseState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'error'; error: AdminApiError; retry: () => void }
  | { status: 'success'; course: CourseResponse };

// Shared by `CourseViewPage` and `CourseFormPage`: unlike a lesson, a
// course's own response already carries its teacher (`PanelCourseTeacher`),
// so there is no second, rabbi-shaped query to join here the way
// `useExistingLesson` needs.
export const useExistingCourse = (id: string | undefined): ExistingCourseState => {
  const query = useQuery({
    queryKey: ADMIN_QUERY_KEYS.course(id ?? ''),
    queryFn: () => fetchAdminCourse(id as string),
    enabled: Boolean(id),
  });

  if (!id) return { status: 'idle' };
  if (query.error instanceof AdminApiError) return { status: 'error', error: query.error, retry: () => void query.refetch() };
  if (query.isPending || !query.data) return { status: 'pending' };
  return { status: 'success', course: query.data };
};
