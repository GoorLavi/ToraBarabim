import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { LessonAddress, RabbiLessonExceptionResponse } from '@torabarabim/common';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';
import { upsertOccurrenceException } from '~/RabbiPanel/UpcomingPage/api';

export interface MoveOccurrenceInput {
  lessonId: string;
  date: string;
  startTime: string;
  address: LessonAddress | undefined;
}

export const useMoveOccurrence = (): UseMutationResult<RabbiLessonExceptionResponse, RabbiApiError, MoveOccurrenceInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, date, startTime, address }: MoveOccurrenceInput) =>
      upsertOccurrenceException(lessonId, date, { kind: 'modified', date, startTime, address }),
    onSuccess: (_data, { lessonId, date }) => {
      void queryClient.invalidateQueries({ queryKey: RABBI_QUERY_KEYS.occurrences() });
      trackEvent(MIXPANEL_EVENTS.occurrenceMoved, { lessonId, date });
    },
  });
};
