import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { logout, RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS, RABBI_ROUTES } from '~/RabbiPanel/consts';

export const useRabbiLogout = (): UseMutationResult<void, RabbiApiError, void> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const endSession = (): void => {
    queryClient.removeQueries({ queryKey: RABBI_QUERY_KEYS.session() });
    navigate(RABBI_ROUTES.login, { replace: true });
  };

  return useMutation({
    mutationFn: logout,
    onSuccess: endSession,
    // A 401 means the session the request tried to end is already gone, so
    // the rabbi is logged out either way. Anything else left the session
    // alive on the server, and saying so beats a silent no-op button.
    onError: (error) => {
      if (error.status === 401) endSession();
    },
  });
};
