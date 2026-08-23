import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { logout, RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS, RABBI_ROUTES } from '~/RabbiPanel/consts';

export const useRabbiLogout = (): UseMutationResult<void, RabbiApiError, void> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: RABBI_QUERY_KEYS.session() });
      navigate(RABBI_ROUTES.login, { replace: true });
    },
  });
};
