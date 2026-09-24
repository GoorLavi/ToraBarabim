import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { CourseResponse } from '@torabarabim/common';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { createCourse, RabbiApiError, updateCourse } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

import { buildCoursePayload } from './helpers';
import type { CourseFormState } from './models';

export interface SaveCourseInput {
  form: CourseFormState;
  existingCourseId: string | undefined;
}

// Create bundles the cover into the same multipart request as the rest of
// the fields (RabbiPanel/api.ts's own `createCourse`); update never touches
// the cover at all, since an existing course replaces it through its own
// immediate upload (`useCourseCoverUpload.ts`), not through this mutation.
export const useSaveCourse = (): UseMutationResult<CourseResponse, RabbiApiError, SaveCourseInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ form, existingCourseId }: SaveCourseInput) => {
      const payload = buildCoursePayload(form);
      if (existingCourseId) return updateCourse(existingCourseId, payload);
      if (!form.cover) throw new Error('useSaveCourse called to create a course before a cover was chosen');
      return createCourse(payload, form.cover);
    },
    onSuccess: (course, { existingCourseId }) => {
      void queryClient.invalidateQueries({ queryKey: RABBI_QUERY_KEYS.courses() });
      queryClient.setQueryData(RABBI_QUERY_KEYS.course(course.id), course);
      trackEvent(MIXPANEL_EVENTS.courseSaved, { courseId: course.id, isNew: !existingCourseId });
    },
  });
};
