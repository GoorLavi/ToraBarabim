import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { LessonExceptionResponse } from '@torabarabim/common';

import { AdminApiError } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

import { saveOccurrenceException } from './api';

export interface CancelOccurrenceExceptionInput {
  lessonId: string;
  date: string;
  existingExceptionId: number | undefined;
  reason: string | undefined;
}

export const useCancelOccurrenceException = (): UseMutationResult<LessonExceptionResponse, AdminApiError, CancelOccurrenceExceptionInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, date, existingExceptionId, reason }: CancelOccurrenceExceptionInput) =>
      saveOccurrenceException(lessonId, existingExceptionId, { kind: 'cancelled', date, reason }),
    onSuccess: (_data, { lessonId }) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.lessonOccurrences(lessonId) });
      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.lessonExceptions(lessonId) });
    },
  });
};
