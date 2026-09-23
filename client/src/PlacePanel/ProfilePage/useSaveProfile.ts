import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { PlaceProfileResponse } from '@torabarabim/common';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { PlaceApiError, updateProfile } from '~/PlacePanel/api';
import { PLACE_QUERY_KEYS } from '~/PlacePanel/consts';

import { nullableTextField } from './helpers';
import type { ProfileFormState } from './models';

export const useSaveProfile = (): UseMutationResult<PlaceProfileResponse, PlaceApiError, ProfileFormState> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (form: ProfileFormState) => {
      if (!form.city) throw new Error('useSaveProfile called before the form passed validation');
      return updateProfile({
        name: form.name.trim(),
        street: form.street.trim(),
        floor: nullableTextField(form.floor, form.existingFloor),
        cityCode: Number(form.city.id),
      });
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(PLACE_QUERY_KEYS.profile(), profile);
      trackEvent(MIXPANEL_EVENTS.profileSaved, { placeId: profile.id });
    },
  });
};
