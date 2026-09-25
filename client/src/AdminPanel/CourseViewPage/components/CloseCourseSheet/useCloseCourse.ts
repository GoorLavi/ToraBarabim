import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { CourseResponse } from '@torabarabim/common';

import { AdminApiError, closeAdminCourse } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export const useCloseCourse = (courseId: string): UseMutationResult<CourseResponse, AdminApiError, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => closeAdminCourse(courseId),
    onSuccess: (course) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.coursesAll() });
      queryClient.setQueryData(ADMIN_QUERY_KEYS.course(courseId), course);
    },
  });
};
