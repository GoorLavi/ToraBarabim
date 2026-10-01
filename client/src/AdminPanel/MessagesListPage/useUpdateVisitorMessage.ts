import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData, UseMutationResult } from '@tanstack/react-query';
import type { AdminVisitorMessage, UpdateVisitorMessageRequest, VisitorMessageListResponse } from '@torabarabim/common';

import { updateAdminVisitorMessage } from '~/AdminPanel/api';
import type { AdminApiError } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

import { replaceMessage } from './helpers';

// One hook for both writes a card makes, the handled toggle and the note,
// because they are one endpoint and one cache write. A card calls it once
// per action so each keeps its own pending and error state; each body names
// only its own key, so neither can overwrite the other.
export const useUpdateVisitorMessage = (
  id: string,
): UseMutationResult<AdminVisitorMessage, AdminApiError, UpdateVisitorMessageRequest> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateVisitorMessageRequest) => updateAdminVisitorMessage(id, body),
    onSuccess: (updated, sent) => {
      // The card stays in the list it is in: written into every cached
      // filter, never refetched, so a message just handled does not leave
      // the "not handled" list under the reader's hand.
      queryClient.setQueriesData<InfiniteData<VisitorMessageListResponse>>(
        { queryKey: ADMIN_QUERY_KEYS.visitorMessagesAll() },
        (current) => current && replaceMessage(current, updated, sent),
      );
      // The filters nobody is looking at are marked stale instead, so opening
      // one fetches it fresh and the change shows up where it now belongs.
      void queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.visitorMessagesAll(),
        refetchType: 'none',
        predicate: (query) => !query.isActive(),
      });
    },
  });
};
