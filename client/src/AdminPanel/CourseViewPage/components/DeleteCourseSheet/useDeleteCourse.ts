import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { AdminApiError, deleteAdminCourse } from '~/AdminPanel/api';

export const useDeleteCourse = (): UseMutationResult<void, AdminApiError, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => deleteAdminCourse(courseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
  });
};
