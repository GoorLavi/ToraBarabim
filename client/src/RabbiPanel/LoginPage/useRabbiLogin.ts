import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { RabbiSessionUser } from '@torabarabim/common';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { login, RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

export const useRabbiLogin = (): UseMutationResult<RabbiSessionUser, RabbiApiError, { identifier: string; password: string }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(RABBI_QUERY_KEYS.session(), user);
      trackEvent(MIXPANEL_EVENTS.rabbiLogin, { rabbiId: user.rabbiId });
    },
  });
};
