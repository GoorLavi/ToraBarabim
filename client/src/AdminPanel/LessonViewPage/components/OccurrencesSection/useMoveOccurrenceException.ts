import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { LessonExceptionResponse, LessonPlace } from '@torabarabim/common';

import { AdminApiError } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

import { saveOccurrenceException } from './api';

export interface MoveOccurrenceExceptionInput {
  lessonId: string;
  date: string;
  existingExceptionId: number | undefined;
  startTime: string;
  place: LessonPlace | undefined;
  // Carried through from the exception this date already had, unchanged by
  // this sheet (which has no control for either): the write is a full
  // replacement server-side, so omitting these on a time- or place-only
  // edit would silently clear them.
  substituteRabbiId: string | undefined;
  note: string | undefined;
}

export const useMoveOccurrenceException = (): UseMutationResult<LessonExceptionResponse, AdminApiError, MoveOccurrenceExceptionInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, date, existingExceptionId, startTime, place, substituteRabbiId, note }: MoveOccurrenceExceptionInput) =>
      saveOccurrenceException(lessonId, existingExceptionId, { kind: 'modified', date, startTime, place, substituteRabbiId, note }),
    onSuccess: (_data, { lessonId }) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.lessonOccurrences(lessonId) });
      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.lessonExceptions(lessonId) });
    },
  });
};
