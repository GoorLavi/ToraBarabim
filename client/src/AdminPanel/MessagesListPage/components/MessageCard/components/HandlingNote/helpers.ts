import { AdminApiError } from '~/AdminPanel/api';
import { adminErrorMessage } from '~/AdminPanel/helpers';

import { SAVE_FAILURE_MESSAGE, SPECIFIC_FAILURE_STATUSES } from './consts';

export const noteSaveFailureMessage = (error: unknown): string =>
  error instanceof AdminApiError && SPECIFIC_FAILURE_STATUSES.includes(error.status) ? adminErrorMessage(error) : SAVE_FAILURE_MESSAGE;
