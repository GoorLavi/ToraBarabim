import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { RabbiLessonResponse } from '@torabarabim/common';

import { createLesson, RabbiApiError, updateLesson } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

import { buildLessonPayload } from './helpers';
import type { LessonFormState } from './models';

export interface SaveLessonInput {
  form: LessonFormState;
  existingLessonId: string | undefined;
}

export const useSaveLesson = (): UseMutationResult<RabbiLessonResponse, RabbiApiError, SaveLessonInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ form, existingLessonId }: SaveLessonInput) => {
      const payload = buildLessonPayload(form);
      return existingLessonId ? updateLesson(existingLessonId, payload) : createLesson(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RABBI_QUERY_KEYS.lessons() });
      void queryClient.invalidateQueries({ queryKey: RABBI_QUERY_KEYS.occurrences() });
    },
  });
};
