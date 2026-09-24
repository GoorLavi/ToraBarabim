import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { CourseResponse, DuplicateCourseRequest } from '@torabarabim/common';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { duplicateCourse, RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

export const useDuplicateCourse = (courseId: string): UseMutationResult<CourseResponse, RabbiApiError, DuplicateCourseRequest> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: DuplicateCourseRequest) => duplicateCourse(courseId, body),
    onSuccess: (course) => {
      void queryClient.invalidateQueries({ queryKey: RABBI_QUERY_KEYS.courses() });
      queryClient.setQueryData(RABBI_QUERY_KEYS.course(course.id), course);
      trackEvent(MIXPANEL_EVENTS.courseSaved, { courseId: course.id, source: 'duplicate' });
    },
  });
};
