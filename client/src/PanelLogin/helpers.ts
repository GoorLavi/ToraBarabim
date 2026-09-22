import { RATE_LIMITED_ERROR } from '~/consts';

import { PanelApiError } from './api';
import * as consts from './consts';

// Status-and-code-aware, mirroring `RabbiPanel/helpers.ts`'s
// `rabbiErrorMessage` and `AdminPanel/helpers.ts`'s `adminErrorMessage`, but
// narrower: this page makes exactly one call, so its error surface is the
// three documented outcomes plus a placeholder for anything else. Never
// renders the raw server message.
export const panelErrorMessage = (error: unknown): string => {
  if (error instanceof PanelApiError) {
    if (error.status === 401) return consts.INVALID_CREDENTIALS_ERROR;
    if (error.code === 'account_deactivated') return consts.DEACTIVATED_ERROR;
    if (error.status === 429) return RATE_LIMITED_ERROR;
  }
  return consts.GENERIC_ERROR_PLACEHOLDER;
};
