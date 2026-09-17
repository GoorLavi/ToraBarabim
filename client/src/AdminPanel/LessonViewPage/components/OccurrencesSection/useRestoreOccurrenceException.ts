import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { AdminApiError, deleteAdminLessonException } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export interface RestoreOccurrenceExceptionInput {
  lessonId: string;
  exceptionId: number;
}

export const useRestoreOccurrenceException = (): UseMutationResult<void, AdminApiError, RestoreOccurrenceExceptionInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, exceptionId }: RestoreOccurrenceExceptionInput) => deleteAdminLessonException(lessonId, exceptionId),
    onSuccess: (_data, { lessonId }) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.lessonOccurrences(lessonId) });
      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.lessonExceptions(lessonId) });
    },
  });
};
