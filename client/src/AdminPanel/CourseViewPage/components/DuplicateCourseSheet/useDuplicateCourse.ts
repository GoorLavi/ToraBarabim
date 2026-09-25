import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { CourseResponse, DuplicateCourseRequest } from '@torabarabim/common';

import { AdminApiError, duplicateAdminCourse } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export const useDuplicateCourse = (courseId: string): UseMutationResult<CourseResponse, AdminApiError, DuplicateCourseRequest> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: DuplicateCourseRequest) => duplicateAdminCourse(courseId, body),
    onSuccess: (course) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.coursesAll() });
      queryClient.setQueryData(ADMIN_QUERY_KEYS.course(course.id), course);
    },
  });
};
