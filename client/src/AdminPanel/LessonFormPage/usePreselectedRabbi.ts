import { useQuery } from '@tanstack/react-query';
import type { Rabbi } from '@torabarabim/common';

import { fetchAdminRabbi } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

// Backs `/admin/lessons/new?rabbiId=...`, the "שיעור חדש" link on a
// rabbi's card (RabbisListPage) and the "save and add the first lesson"
// action on RabbiFormPage.
export const usePreselectedRabbi = (rabbiId: string | null): Rabbi | undefined => {
  const query = useQuery({
    queryKey: ADMIN_QUERY_KEYS.rabbi(rabbiId ?? ''),
    queryFn: () => fetchAdminRabbi(rabbiId as string),
    enabled: Boolean(rabbiId),
  });
  return query.data;
};
