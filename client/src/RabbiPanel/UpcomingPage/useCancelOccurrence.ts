import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { RabbiLessonExceptionResponse } from '@torabarabim/common';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

import { upsertOccurrenceException } from './api';

export interface CancelOccurrenceInput {
  lessonId: string;
  date: string;
}

export const useCancelOccurrence = (): UseMutationResult<RabbiLessonExceptionResponse, RabbiApiError, CancelOccurrenceInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, date }: CancelOccurrenceInput) => upsertOccurrenceException(lessonId, date, { kind: 'cancelled', date }),
    onSuccess: (_data, { lessonId, date }) => {
      void queryClient.invalidateQueries({ queryKey: RABBI_QUERY_KEYS.occurrences() });
      trackEvent(MIXPANEL_EVENTS.occurrenceCancelled, { lessonId, date });
    },
  });
};
