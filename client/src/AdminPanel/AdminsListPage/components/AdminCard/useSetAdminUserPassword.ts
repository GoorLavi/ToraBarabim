import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { AdminUserListItem } from '@torabarabim/common';

import { setAdminUserPassword } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export const useSetAdminUserPassword = (id: string): UseMutationResult<AdminUserListItem, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (password: string) => setAdminUserPassword(id, password),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.adminUsers({}) }),
  });
};
