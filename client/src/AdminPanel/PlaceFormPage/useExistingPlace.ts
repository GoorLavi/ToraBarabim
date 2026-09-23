import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AdminPlaceResponse } from '@torabarabim/common';

import { AdminApiError, fetchAdminPlace } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export const useExistingPlace = (id: string | undefined): UseQueryResult<AdminPlaceResponse, AdminApiError> =>
  useQuery({
    queryKey: ADMIN_QUERY_KEYS.place(id ?? ''),
    queryFn: () => fetchAdminPlace(id as string),
    enabled: Boolean(id),
  });
