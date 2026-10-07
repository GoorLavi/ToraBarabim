import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { PanelLoginResponse } from '@torabarabim/common';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { resetPanelUser, trackEvent } from '~/analytics/mixpanel';

import { login, PanelApiError } from './api';

export const usePanelLogin = (): UseMutationResult<
  PanelLoginResponse,
  PanelApiError,
  { identifier: string; password: string; from?: string }
> =>
  useMutation({
    mutationFn: login,
    // Reset before the event, so a browser still carrying the last account's
    // identity never has this login attributed to it (decision 0061).
    onSuccess: () => {
      resetPanelUser();
      trackEvent(MIXPANEL_EVENTS.panelLogin);
    },
  });
