import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { HomeResponse } from '@torabarabim/common';

import { fetchHomeRows, HomeApiError } from './api';
import { HOME_DATA_RETRY_LIMIT, HOME_QUERY_KEYS } from './consts';

export const useHomeRows = (enabled: boolean): UseQueryResult<HomeResponse, HomeApiError> =>
  useQuery({
    queryKey: HOME_QUERY_KEYS.homeRows(),
    queryFn: fetchHomeRows,
    enabled,
    retry: HOME_DATA_RETRY_LIMIT,
  });
