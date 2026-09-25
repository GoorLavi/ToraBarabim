import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { CourseResponse } from '@torabarabim/common';

import { AdminApiError, markAdminCourseFull } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export const useMarkCourseFull = (courseId: string): UseMutationResult<CourseResponse, AdminApiError, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAdminCourseFull(courseId),
    onSuccess: (course) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      queryClient.setQueryData(ADMIN_QUERY_KEYS.course(courseId), course);
    },
  });
};
