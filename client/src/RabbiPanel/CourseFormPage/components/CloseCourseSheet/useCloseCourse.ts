import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { CourseResponse } from '@torabarabim/common';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { closeCourse, RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

export const useCloseCourse = (courseId: string): UseMutationResult<CourseResponse, RabbiApiError, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => closeCourse(courseId),
    onSuccess: (course) => {
      void queryClient.invalidateQueries({ queryKey: RABBI_QUERY_KEYS.courses() });
      queryClient.setQueryData(RABBI_QUERY_KEYS.course(courseId), course);
      trackEvent(MIXPANEL_EVENTS.courseRegistrationClosed, { courseId, reason: 'closed' });
    },
  });
};
