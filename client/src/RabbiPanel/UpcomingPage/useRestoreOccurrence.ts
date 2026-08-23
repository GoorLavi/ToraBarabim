import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

import { removeOccurrenceException } from './api';

export interface RestoreOccurrenceInput {
  lessonId: string;
  date: string;
}

export const useRestoreOccurrence = (): UseMutationResult<void, RabbiApiError, RestoreOccurrenceInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, date }: RestoreOccurrenceInput) => removeOccurrenceException(lessonId, date),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RABBI_QUERY_KEYS.occurrences() });
    },
  });
};
