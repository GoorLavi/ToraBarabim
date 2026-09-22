import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ResetPlacePasswordResponse } from '@torabarabim/common';

import { resetPlacePassword } from '~/AdminPanel/api';

// Nothing about the account record itself changes on reset (email and
// active status are untouched), so there is no query cache to update: the
// only new fact is the temporary password, which the caller lifts out of
// `mutation.data` for its own one-time display.
export const useResetPlacePassword = (placeId: string): UseMutationResult<ResetPlacePasswordResponse, Error, void> =>
  useMutation({
    mutationFn: () => resetPlacePassword(placeId),
  });
