import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { LessonSearchResponse } from '@torabarabim/common';

import { fetchLessons, HomeApiError } from './api';
import { HOME_QUERY_KEYS } from './consts';
import type { LessonFilters } from './models';

export const useLessonSearch = (
  filters: LessonFilters,
  enabled = true,
): UseQueryResult<LessonSearchResponse, HomeApiError> =>
  useQuery({
    queryKey: HOME_QUERY_KEYS.lessons(filters),
    queryFn: () => fetchLessons(filters),
    enabled,
  });
