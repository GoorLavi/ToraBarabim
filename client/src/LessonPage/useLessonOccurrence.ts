import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { LessonOccurrence } from '@torabarabim/common';

import { fetchLessonOccurrence, LessonPageApiError } from './api';
import { LESSON_PAGE_QUERY_KEYS, LESSON_PAGE_RETRY_LIMIT } from './consts';

export const useLessonOccurrence = (lessonId: string, date: string): UseQueryResult<LessonOccurrence, LessonPageApiError> =>
  useQuery({
    queryKey: LESSON_PAGE_QUERY_KEYS.occurrence(lessonId, date),
    queryFn: ({ signal }) => fetchLessonOccurrence(lessonId, date, signal),
    // A 404 is a fact about the lesson, not a transient failure: retrying it
    // only delays reaching the not-found screen. Network and server errors
    // still get one retry.
    retry: (failureCount, error) => error.status !== 404 && failureCount < LESSON_PAGE_RETRY_LIMIT,
  });
