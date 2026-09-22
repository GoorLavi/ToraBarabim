import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { PlaceLessonResponse } from '@torabarabim/common';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { createLesson, PlaceApiError, updateLesson } from '~/PlacePanel/api';
import { PLACE_QUERY_KEYS } from '~/PlacePanel/consts';

import { buildLessonPayload } from './helpers';
import type { LessonFormState } from './models';

export interface SaveLessonInput {
  form: LessonFormState;
  existingLessonId: string | undefined;
}

export const useSaveLesson = (): UseMutationResult<PlaceLessonResponse, PlaceApiError, SaveLessonInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ form, existingLessonId }: SaveLessonInput) => {
      const payload = buildLessonPayload(form);
      return existingLessonId ? updateLesson(existingLessonId, payload) : createLesson(payload);
    },
    onSuccess: (lesson, { existingLessonId }) => {
      void queryClient.invalidateQueries({ queryKey: PLACE_QUERY_KEYS.lessons() });
      trackEvent(MIXPANEL_EVENTS.lessonSaved, { lessonId: lesson.id, isNew: !existingLessonId });
    },
  });
};
