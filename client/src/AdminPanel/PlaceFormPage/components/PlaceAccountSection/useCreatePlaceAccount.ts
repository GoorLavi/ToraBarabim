import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { CreatePlaceAccountRequest, PlaceAccountCreatedResponse } from '@torabarabim/common';

import { createPlaceAccount } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export const useCreatePlaceAccount = (
  placeId: string,
): UseMutationResult<PlaceAccountCreatedResponse, Error, CreatePlaceAccountRequest> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePlaceAccountRequest) => createPlaceAccount(placeId, body),
    // The cached account never carries `temporaryPassword`: the caller
    // lifts it out for its own one-time display, and nothing else should
    // be able to read it back off this mutation or the query cache again.
    onSuccess: ({ temporaryPassword: _temporaryPassword, ...account }) =>
      queryClient.setQueryData(ADMIN_QUERY_KEYS.placeAccount(placeId), account),
  });
};
