import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AdminDedication } from '@torabarabim/common';

import { AdminApiError, fetchAdminDedication } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

// Shared by `DedicationFormPage` (edit mode) and `DedicationViewPage`, the
// nearest common ancestor both sit under. Both screens can be opened cold at
// their own URL with no list response in hand, so each fetches the single
// record by id rather than reading it out of a cached list.
export const useExistingDedication = (id: string | undefined): UseQueryResult<AdminDedication, AdminApiError> =>
  useQuery({
    queryKey: ADMIN_QUERY_KEYS.dedication(id ?? ''),
    queryFn: () => fetchAdminDedication(id as string),
    enabled: Boolean(id),
  });
