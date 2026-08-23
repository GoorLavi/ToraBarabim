import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { RabbiProfileResponse } from '@torabarabim/common';

import { RabbiApiError, updateProfile } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

import { nullableTextField } from './helpers';
import type { ProfileFormState } from './models';

export const useSaveProfile = (): UseMutationResult<RabbiProfileResponse, RabbiApiError, ProfileFormState> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (form: ProfileFormState) =>
      updateProfile({
        name: form.name.trim(),
        title: nullableTextField(form.title, form.existingTitle),
        bio: nullableTextField(form.bio, form.existingBio),
      }),
    onSuccess: (profile) => {
      queryClient.setQueryData(RABBI_QUERY_KEYS.profile(), profile);
      void queryClient.invalidateQueries({ queryKey: RABBI_QUERY_KEYS.session() });
    },
  });
};
