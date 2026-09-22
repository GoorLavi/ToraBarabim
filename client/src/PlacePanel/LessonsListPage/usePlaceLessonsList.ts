import { useQuery } from '@tanstack/react-query';

import { fetchLessons, PlaceApiError } from '~/PlacePanel/api';
import { PLACE_LESSON_PAGE_SIZE, PLACE_QUERY_KEYS } from '~/PlacePanel/consts';

import type { LessonsListState } from './models';

export const usePlaceLessonsList = (): LessonsListState => {
  const query = useQuery({
    queryKey: PLACE_QUERY_KEYS.lessons(),
    queryFn: () => fetchLessons({ page: 1, pageSize: PLACE_LESSON_PAGE_SIZE }),
  });

  if (query.error instanceof PlaceApiError) return { status: 'error', retry: () => void query.refetch() };
  if (!query.data) return { status: 'pending' };
  return { status: 'success', lessons: query.data.items };
};
