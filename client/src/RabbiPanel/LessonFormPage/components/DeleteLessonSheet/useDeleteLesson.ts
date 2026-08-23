import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { deleteLesson, RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

export const useDeleteLesson = (): UseMutationResult<void, RabbiApiError, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => deleteLesson(lessonId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RABBI_QUERY_KEYS.lessons() });
      void queryClient.invalidateQueries({ queryKey: RABBI_QUERY_KEYS.occurrences() });
    },
  });
};
