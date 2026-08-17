import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { AdminApiError, logout } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS, ADMIN_ROUTES } from '~/AdminPanel/consts';

export const useAdminLogout = (): UseMutationResult<void, AdminApiError, void> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ADMIN_QUERY_KEYS.session() });
      navigate(ADMIN_ROUTES.login, { replace: true });
    },
  });
};
