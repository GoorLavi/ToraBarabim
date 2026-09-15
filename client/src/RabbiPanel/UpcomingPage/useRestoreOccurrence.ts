import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
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
    onSuccess: (data, { lessonId, date }) => {
      void queryClient.invalidateQueries({ queryKey: RABBI_QUERY_KEYS.occurrences() });
      trackEvent(MIXPANEL_EVENTS.occurrenceRestored, { lessonId, date });
    },
  });
};
