import { useQuery } from '@tanstack/react-query';

import { fetchLessons, fetchOccurrences, RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_LESSON_PAGE_SIZE, RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

import { groupByDay, withDerivedFields } from './helpers';
import type { UpcomingState } from './models';

// Combines the occurrence window with the rabbi's own lesson list (needed
// to detect a moved time and to fall back an untitled lesson's kind), so
// this is the one place that decides among the four screen states:
// loading, "never added a lesson", "has lessons but none in this window",
// and success.
export const useUpcomingOccurrences = (): UpcomingState => {
  const occurrencesQuery = useQuery({ queryKey: RABBI_QUERY_KEYS.occurrences(), queryFn: fetchOccurrences });
  const lessonsQuery = useQuery({
    queryKey: RABBI_QUERY_KEYS.lessons(),
    queryFn: () => fetchLessons({ page: 1, pageSize: RABBI_LESSON_PAGE_SIZE }),
  });

  const retry = (): void => {
    void occurrencesQuery.refetch();
    void lessonsQuery.refetch();
  };

  const firstError = occurrencesQuery.error ?? lessonsQuery.error;
  if (firstError instanceof RabbiApiError) return { status: 'error', retry };

  if (!occurrencesQuery.data || !lessonsQuery.data) return { status: 'pending' };

  if (lessonsQuery.data.total === 0) return { status: 'emptyFirst' };
  if (occurrencesQuery.data.items.length === 0) return { status: 'emptyWindow' };

  const lessonsById = new Map(lessonsQuery.data.items.map((lesson) => [lesson.id, lesson] as const));
  const occurrences = withDerivedFields(occurrencesQuery.data.items, lessonsById);

  return { status: 'success', groups: groupByDay(occurrences) };
};
