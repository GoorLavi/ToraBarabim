import { useQuery } from '@tanstack/react-query';
import type { RabbiLessonResponse } from '@torabarabim/common';

import { fetchLesson, RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

export type ExistingLessonState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'error'; error: RabbiApiError; retry: () => void }
  | { status: 'success'; lesson: RabbiLessonResponse };

export const useExistingLesson = (id: string | undefined): ExistingLessonState => {
  const query = useQuery({
    queryKey: RABBI_QUERY_KEYS.lesson(id ?? ''),
    queryFn: () => fetchLesson(id as string),
    enabled: Boolean(id),
  });

  if (!id) return { status: 'idle' };
  if (query.error instanceof RabbiApiError) return { status: 'error', error: query.error, retry: () => void query.refetch() };
  if (query.isPending || !query.data) return { status: 'pending' };
  return { status: 'success', lesson: query.data };
};
