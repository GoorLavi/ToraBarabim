import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { RabbiAccountCreatedResponse } from '@torabarabim/common';

import { createRabbiAccount } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export const useCreateRabbiAccount = (rabbiId: string): UseMutationResult<RabbiAccountCreatedResponse, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => createRabbiAccount(rabbiId, { email }),
    // The cached account never carries `temporaryPassword`: the caller
    // lifts it out for its own one-time display, and nothing else should
    // be able to read it back off this mutation or the query cache again.
    onSuccess: ({ temporaryPassword: _temporaryPassword, ...account }) =>
      queryClient.setQueryData(ADMIN_QUERY_KEYS.rabbiAccount(rabbiId), account),
  });
};
