import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { RabbiResponse } from '@torabarabim/common';

import { AdminApiError, fetchAdminRabbi } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export const useExistingRabbi = (id: string | undefined): UseQueryResult<RabbiResponse, AdminApiError> =>
  useQuery({
    queryKey: ADMIN_QUERY_KEYS.rabbi(id ?? ''),
    queryFn: () => fetchAdminRabbi(id as string),
    enabled: Boolean(id),
  });
