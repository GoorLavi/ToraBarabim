import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { deleteAdminUser } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export const useDeleteAdminUser = (id: string): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteAdminUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.adminUsers({}) }),
  });
};
