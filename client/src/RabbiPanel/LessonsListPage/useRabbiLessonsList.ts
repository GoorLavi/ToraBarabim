import { useQuery } from '@tanstack/react-query';

import { fetchLessons, RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_LESSON_PAGE_SIZE, RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

import type { LessonsListState } from './models';

export const useRabbiLessonsList = (): LessonsListState => {
  const query = useQuery({
    queryKey: RABBI_QUERY_KEYS.lessons(),
    queryFn: () => fetchLessons({ page: 1, pageSize: RABBI_LESSON_PAGE_SIZE }),
  });

  if (query.error instanceof RabbiApiError) return { status: 'error', retry: () => void query.refetch() };
  if (!query.data) return { status: 'pending' };
  return { status: 'success', lessons: query.data.items };
};
