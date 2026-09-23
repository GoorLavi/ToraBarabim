import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { logout, PlaceApiError } from '~/PlacePanel/api';
import { PLACE_QUERY_KEYS, PLACE_ROUTES } from '~/PlacePanel/consts';

export const usePlaceLogout = (): UseMutationResult<void, PlaceApiError, void> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const endSession = (): void => {
    queryClient.removeQueries({ queryKey: PLACE_QUERY_KEYS.session() });
    navigate(PLACE_ROUTES.login, { replace: true });
  };

  return useMutation({
    mutationFn: logout,
    onSuccess: endSession,
    // A 401 means the session the request tried to end is already gone, so
    // the place is logged out either way. Anything else left the session
    // alive on the server, and saying so beats a silent no-op button.
    onError: (error) => {
      if (error.status === 401) endSession();
    },
  });
};
