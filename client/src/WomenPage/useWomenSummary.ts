import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { WomenAreaResponse } from '@torabarabim/common';

import { fetchWomenAreaSummary, WomenPageApiError } from './api';
import { WOMEN_PAGE_QUERY_KEYS, WOMEN_PAGE_RETRY_LIMIT } from './consts';

// Backs the page's rail (whichever branch of the union it lands on) and its
// heading count, run alongside the page's own lesson search rather than
// after it: neither needs the other to start.
export const useWomenSummary = (): UseQueryResult<WomenAreaResponse, WomenPageApiError> =>
  useQuery({
    queryKey: WOMEN_PAGE_QUERY_KEYS.summary(),
    queryFn: ({ signal }) => fetchWomenAreaSummary(signal),
    retry: WOMEN_PAGE_RETRY_LIMIT,
  });
