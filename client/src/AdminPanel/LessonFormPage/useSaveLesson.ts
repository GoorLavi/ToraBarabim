import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Lesson } from '@torabarabim/common';

import { AdminApiError, createAdminLesson, updateAdminLesson } from '~/AdminPanel/api';

import { buildLessonPayload } from './helpers';
import type { LessonFormState } from './models';

export interface SaveLessonInput {
  form: LessonFormState;
  existingLessonId: string | undefined;
}

// A lesson now carries its own venue as plain text plus a structured city
// code, so saving it is a single write: no place to resolve first.
export const useSaveLesson = (): UseMutationResult<Lesson, AdminApiError, SaveLessonInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ form, existingLessonId }: SaveLessonInput) => {
      const payload = buildLessonPayload(form);
      return existingLessonId ? updateAdminLesson(existingLessonId, payload) : createAdminLesson(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'lessons'] });
    },
  });
};
