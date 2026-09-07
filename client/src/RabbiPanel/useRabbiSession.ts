import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { RabbiSessionUser } from '@torabarabim/common';

import { fetchSession, RabbiApiError } from './api';
import { RABBI_QUERY_KEYS } from './consts';

// A long stale time on purpose: this is UX polish to avoid a flash of
// protected content before redirecting, not the security boundary. The
// server checks the session cookie on every rabbi request regardless of
// what this query returns.
export const useRabbiSession = (): UseQueryResult<RabbiSessionUser, RabbiApiError> =>
  useQuery({
    queryKey: RABBI_QUERY_KEYS.session(),
    queryFn: fetchSession,
    staleTime: 5 * 60_000,
    retry: false,
  });
