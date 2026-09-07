import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { RabbiAccountResponse } from '@torabarabim/common';

import { AdminApiError, fetchRabbiAccount } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export const useRabbiAccount = (rabbiId: string | undefined): UseQueryResult<RabbiAccountResponse, AdminApiError> =>
  useQuery({
    queryKey: ADMIN_QUERY_KEYS.rabbiAccount(rabbiId ?? ''),
    queryFn: () => fetchRabbiAccount(rabbiId as string),
    enabled: Boolean(rabbiId),
    // A 404 'account_not_found' is a normal, common state (most rabbis
    // start with no account), not a transient failure worth retrying.
    retry: (failureCount, error) => error.code !== 'account_not_found' && failureCount < 1,
  });
