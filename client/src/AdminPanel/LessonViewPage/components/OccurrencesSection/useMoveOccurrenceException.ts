import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { LessonAddress, LessonExceptionResponse } from '@torabarabim/common';

import { AdminApiError } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

import { saveOccurrenceException } from './api';

export interface MoveOccurrenceExceptionInput {
  lessonId: string;
  date: string;
  existingExceptionId: number | undefined;
  startTime: string;
  address: LessonAddress | undefined;
}

export const useMoveOccurrenceException = (): UseMutationResult<LessonExceptionResponse, AdminApiError, MoveOccurrenceExceptionInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, date, existingExceptionId, startTime, address }: MoveOccurrenceExceptionInput) =>
      saveOccurrenceException(lessonId, existingExceptionId, { kind: 'modified', date, startTime, address }),
    onSuccess: (_data, { lessonId }) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.lessonOccurrences(lessonId) });
      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.lessonExceptions(lessonId) });
    },
  });
};
