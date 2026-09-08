import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { AdminUserListItem } from '@torabarabim/common';

import { setAdminUserActive } from '~/AdminPanel/api';

export const useSetAdminUserActive = (id: string): UseMutationResult<AdminUserListItem, Error, boolean> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isActive: boolean) => setAdminUserActive(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'admin-users'] }),
  });
};
