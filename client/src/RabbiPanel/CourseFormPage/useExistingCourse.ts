import { useQuery } from '@tanstack/react-query';
import type { CourseResponse } from '@torabarabim/common';

import { fetchCourse, RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

export type ExistingCourseState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'error'; error: RabbiApiError; retry: () => void }
  | { status: 'success'; course: CourseResponse };

export const useExistingCourse = (id: string | undefined): ExistingCourseState => {
  const query = useQuery({
    queryKey: RABBI_QUERY_KEYS.course(id ?? ''),
    queryFn: () => fetchCourse(id as string),
    enabled: Boolean(id),
  });

  if (!id) return { status: 'idle' };
  if (query.error instanceof RabbiApiError) return { status: 'error', error: query.error, retry: () => void query.refetch() };
  if (query.isPending || !query.data) return { status: 'pending' };
  return { status: 'success', course: query.data };
};
