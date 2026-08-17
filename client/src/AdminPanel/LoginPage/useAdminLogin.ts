import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import type { AdminUser } from '@torabarabim/common';

import { AdminApiError, login } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export const useAdminLogin = (): UseMutationResult<AdminUser, AdminApiError, { email: string; password: string }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(ADMIN_QUERY_KEYS.session(), user);
    },
  });
};
