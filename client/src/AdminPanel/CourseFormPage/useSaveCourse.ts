import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { CourseResponse } from '@torabarabim/common';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { AdminApiError, createAdminCourse, updateAdminCourse } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';
import type { CourseFormState } from '~/components/CourseFormFields/models';

import type { TeacherFormValue } from './components/TeacherPicker/models';
import { buildAdminCoursePayload } from './helpers';

export interface SaveCourseInput {
  form: CourseFormState;
  teacher: TeacherFormValue;
  existingCourseId: string | undefined;
}

// Create bundles the cover into the same multipart request as the rest of
// the fields; update never touches the cover at all, since an existing
// course replaces it through its own immediate upload
// (`useCourseCoverUpload.ts`), not through this mutation.
export const useSaveCourse = (): UseMutationResult<CourseResponse, AdminApiError, SaveCourseInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ form, teacher, existingCourseId }: SaveCourseInput) => {
      const payload = buildAdminCoursePayload(form, teacher);
      if (existingCourseId) return updateAdminCourse(existingCourseId, payload);
      if (!form.cover) throw new Error('useSaveCourse called to create a course before a cover was chosen');
      return createAdminCourse(payload, form.cover);
    },
    onSuccess: (course, { existingCourseId }) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.coursesAll() });
      queryClient.setQueryData(ADMIN_QUERY_KEYS.course(course.id), course);
      trackEvent(MIXPANEL_EVENTS.courseSaved, { courseId: course.id, isNew: !existingCourseId });
    },
  });
};
