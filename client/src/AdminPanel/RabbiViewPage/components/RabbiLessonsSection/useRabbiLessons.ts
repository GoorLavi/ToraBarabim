import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { LessonListResponse } from '@torabarabim/common';

import { AdminApiError, fetchAdminLessons } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';
import { INLINE_LESSON_CAP } from '~/AdminPanel/RabbiViewPage/consts';

export const useRabbiLessons = (rabbiId: string): UseQueryResult<LessonListResponse, AdminApiError> => {
  const filters = { rabbiId, pageSize: INLINE_LESSON_CAP };
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.lessons(filters),
    queryFn: () => fetchAdminLessons(filters),
  });
};
