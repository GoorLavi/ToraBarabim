import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { AdminApiError, logout } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS, ADMIN_ROUTES } from '~/AdminPanel/consts';

export const useAdminLogout = (): UseMutationResult<void, AdminApiError, void> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const endSession = (): void => {
    queryClient.removeQueries({ queryKey: ADMIN_QUERY_KEYS.session() });
    navigate(ADMIN_ROUTES.login, { replace: true });
  };

  return useMutation({
    mutationFn: logout,
    onSuccess: endSession,
    // A 401 means the session the request tried to end is already gone, so
    // the admin is logged out either way. Anything else left the session
    // alive on the server, and saying so beats a silent no-op button.
    onError: (error) => {
      if (error.status === 401) endSession();
    },
  });
};
