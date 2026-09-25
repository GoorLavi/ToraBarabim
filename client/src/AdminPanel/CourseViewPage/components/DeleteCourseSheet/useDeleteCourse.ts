import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { AdminApiError, deleteAdminCourse } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export const useDeleteCourse = (): UseMutationResult<void, AdminApiError, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => deleteAdminCourse(courseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.coursesAll() });
    },
  });
};
