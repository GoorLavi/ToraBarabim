import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { LessonListResponse } from '@torabarabim/common';

import { AdminApiError, fetchAdminLessons } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export const useRabbiLessonCount = (rabbiId: string | undefined): UseQueryResult<LessonListResponse, AdminApiError> => {
  const filters = { rabbiId, pageSize: 1 };
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.lessons(filters),
    queryFn: () => fetchAdminLessons(filters),
    enabled: Boolean(rabbiId),
  });
};
