import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ResetRabbiPasswordResponse } from '@torabarabim/common';

import { resetRabbiPassword } from '~/AdminPanel/api';

// Nothing about the account record itself changes on reset (email and
// active status are untouched), so there is no query cache to update:
// the only new fact is the temporary password, which the caller lifts out
// of `mutation.data` for its own one-time display.
export const useResetRabbiPassword = (rabbiId: string): UseMutationResult<ResetRabbiPasswordResponse, Error, void> =>
  useMutation({
    mutationFn: () => resetRabbiPassword(rabbiId),
  });
