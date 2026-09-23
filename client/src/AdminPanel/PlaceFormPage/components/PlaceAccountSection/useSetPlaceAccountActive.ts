import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { PlaceAccountResponse } from '@torabarabim/common';

import { updatePlaceAccount } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export const useSetPlaceAccountActive = (placeId: string): UseMutationResult<PlaceAccountResponse, Error, boolean> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isActive: boolean) => updatePlaceAccount(placeId, { isActive }),
    onSuccess: (account) => queryClient.setQueryData(ADMIN_QUERY_KEYS.placeAccount(placeId), account),
  });
};
