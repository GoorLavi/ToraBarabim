import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { PlaceAccountResponse } from '@torabarabim/common';

import { AdminApiError, fetchPlaceAccount } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export const usePlaceAccount = (placeId: string | undefined): UseQueryResult<PlaceAccountResponse, AdminApiError> =>
  useQuery({
    queryKey: ADMIN_QUERY_KEYS.placeAccount(placeId ?? ''),
    queryFn: () => fetchPlaceAccount(placeId as string),
    enabled: Boolean(placeId),
    // A 404 'account_not_found' is a normal, common state (most places
    // start with no account), not a transient failure worth retrying.
    retry: (failureCount, error) => error.code !== 'account_not_found' && failureCount < 1,
  });
