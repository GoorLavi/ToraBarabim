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
    // The browser can still carry the last account's identity: a session
    // that expired without a logout, or someone else's login on a shared
    // computer. Reset first, so the login and everything after it belong to
    // the account the panel shell is about to identify, not the previous one.
    onSuccess: () => {
      resetPanelUser();
      trackEvent(MIXPANEL_EVENTS.panelLogin);
    },
  });
