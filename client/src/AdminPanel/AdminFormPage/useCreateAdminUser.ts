import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { AdminUserListItem, CreateAdminUserRequest } from '@torabarabim/common';

import { AdminApiError, createAdminUser } from '~/AdminPanel/api';

export const useCreateAdminUser = (): UseMutationResult<AdminUserListItem, AdminApiError, CreateAdminUserRequest> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'admin-users'] }),
  });
};
