import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { CreatePlaceRequest, Lesson } from '@torabarabim/common';

import { AdminApiError, createAdminLesson, createAdminPlace, updateAdminLesson, updateAdminPlace } from '~/AdminPanel/api';

import { buildLessonPayload } from './helpers';
import type { LessonFormState } from './models';

export interface SaveLessonInput {
  form: LessonFormState;
  existingLessonId: string | undefined;
  existingPlaceId: string | undefined;
}

// A lesson's `placeId` must point at a real place (client/CLAUDE.md: no
// place-management screen exists in this slice), so saving a lesson is
// really two writes: resolve the place first (create it on a brand new
// lesson, update the lesson's own place record in place on an edit, see
// the report for this slice), then write the lesson with that `placeId`.
export const useSaveLesson = (): UseMutationResult<Lesson, AdminApiError, SaveLessonInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ form, existingLessonId, existingPlaceId }: SaveLessonInput) => {
      if (!form.city) {
        throw new Error('useSaveLesson called before the form passed validation');
      }

      const placeInput: CreatePlaceRequest = { name: form.placeName.trim(), address: form.placeAddress.trim(), cityId: form.city.id };
      const place = existingPlaceId ? await updateAdminPlace(existingPlaceId, placeInput) : await createAdminPlace(placeInput);

      const payload = buildLessonPayload(form, place.id);
      return existingLessonId ? updateAdminLesson(existingLessonId, payload) : createAdminLesson(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'lessons'] });
    },
  });
};
