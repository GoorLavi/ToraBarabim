import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { RabbiAccountResponse } from '@torabarabim/common';

import { updateRabbiAccount } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export const useSetRabbiAccountActive = (rabbiId: string): UseMutationResult<RabbiAccountResponse, Error, boolean> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isActive: boolean) => updateRabbiAccount(rabbiId, { isActive }),
    onSuccess: (account) => queryClient.setQueryData(ADMIN_QUERY_KEYS.rabbiAccount(rabbiId), account),
  });
};
