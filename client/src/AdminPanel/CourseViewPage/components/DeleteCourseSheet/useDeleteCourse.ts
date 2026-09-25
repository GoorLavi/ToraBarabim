import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { AdminApiError, deleteAdminCourse } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export const useDeleteCourse = (): UseMutationResult<void, AdminApiError, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => deleteAdminCourse(courseId),
    onSuccess: (_data, courseId) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.coursesAll() });
      trackEvent(MIXPANEL_EVENTS.courseDeleted, { courseId });
    },
  });
};
