import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { deleteCourse, RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

export const useDeleteCourse = (): UseMutationResult<void, RabbiApiError, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => deleteCourse(courseId),
    onSuccess: (_data, courseId) => {
      void queryClient.invalidateQueries({ queryKey: RABBI_QUERY_KEYS.courses() });
      trackEvent(MIXPANEL_EVENTS.courseDeleted, { courseId });
    },
  });
};
