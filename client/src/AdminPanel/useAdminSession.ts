import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AdminUser } from '@torabarabim/common';

import { AdminApiError, fetchSession } from './api';
import { ADMIN_QUERY_KEYS } from './consts';

// A long stale time on purpose: this is UX polish to avoid a flash of
// protected content before redirecting, not the security boundary. The
// server checks the session cookie on every admin request regardless of
// what this query returns.
export const useAdminSession = (): UseQueryResult<AdminUser, AdminApiError> =>
  useQuery({
    queryKey: ADMIN_QUERY_KEYS.session(),
    queryFn: fetchSession,
    staleTime: 5 * 60_000,
    retry: false,
  });
