import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { deleteLesson, RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

export const useDeleteLesson = (): UseMutationResult<void, RabbiApiError, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => deleteLesson(lessonId),
    onSuccess: (_data, lessonId) => {
      void queryClient.invalidateQueries({ queryKey: RABBI_QUERY_KEYS.lessons() });
      void queryClient.invalidateQueries({ queryKey: RABBI_QUERY_KEYS.occurrences() });
      trackEvent(MIXPANEL_EVENTS.lessonDeleted, { lessonId });
    },
  });
};
