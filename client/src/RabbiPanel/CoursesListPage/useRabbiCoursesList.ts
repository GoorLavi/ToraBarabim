import { useQuery } from '@tanstack/react-query';

import { fetchCourses, RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

import type { CoursesListState } from './models';

export const useRabbiCoursesList = (): CoursesListState => {
  const query = useQuery({
    queryKey: RABBI_QUERY_KEYS.courses(),
    queryFn: fetchCourses,
  });

  if (query.error instanceof RabbiApiError) return { status: 'error', retry: () => void query.refetch() };
  if (!query.data) return { status: 'pending' };
  return { status: 'success', courses: query.data.items };
};
