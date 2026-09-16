import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AudienceScope, LessonSearchResponse } from '@torabarabim/common';

import { fetchLessons, RabbiPageApiError } from './api';
import { RABBI_PAGE_QUERY_KEYS, RABBI_PAGE_RETRY_LIMIT } from './consts';

// Waits on `scope`, which the page derives from `rabbi.honorific`
// (RabbiPage.tsx): a rabbanit's own lessons only come back from the public
// search under `scope=women` (0026), so this can no longer run alongside
// useRabbiDetail the way it did before honorific-based scoping existed. It
// still fires as soon as that one value is known, not speculatively.
export const useRabbiLessons = (rabbiId: string, scope: AudienceScope | undefined): UseQueryResult<LessonSearchResponse, RabbiPageApiError> =>
  useQuery({
    queryKey: RABBI_PAGE_QUERY_KEYS.lessons(rabbiId, scope),
    queryFn: ({ signal }) => fetchLessons({ rabbiId, scope }, signal),
    enabled: rabbiId.length > 0 && Boolean(scope),
    retry: (failureCount) => failureCount < RABBI_PAGE_RETRY_LIMIT,
  });
