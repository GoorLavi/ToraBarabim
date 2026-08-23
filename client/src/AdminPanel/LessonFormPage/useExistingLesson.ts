import { useQuery } from '@tanstack/react-query';
import type { LessonResponse, Rabbi } from '@torabarabim/common';

import { AdminApiError, fetchAdminLesson, fetchAdminRabbi } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';
import type { SelectedCity } from '~/components/CitySelect/models';

export interface ExistingLessonData {
  lesson: LessonResponse;
  rabbi: Rabbi | undefined;
  city: SelectedCity | undefined;
}

export type ExistingLessonState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'error'; error: AdminApiError; retry: () => void }
  | { status: 'success'; data: ExistingLessonData };

// The venue is on the lesson itself now (`lesson.place`), so no place fetch
// is needed to load an existing lesson: just the lesson, then the rabbi it
// unlocks. `LessonResponse.place` already carries the resolved `cityName`,
// so no separate city lookup is needed either.
export const useExistingLesson = (id: string | undefined): ExistingLessonState => {
  const lessonQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.lesson(id ?? ''),
    queryFn: () => fetchAdminLesson(id as string),
    enabled: Boolean(id),
  });

  const rabbiId = lessonQuery.data?.rabbiId;

  const rabbiQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.rabbi(rabbiId ?? ''),
    queryFn: () => fetchAdminRabbi(rabbiId as string),
    enabled: Boolean(rabbiId),
  });

  if (!id) return { status: 'idle' };

  const retry = (): void => {
    void lessonQuery.refetch();
  };

  const firstError = lessonQuery.error ?? rabbiQuery.error;
  if (firstError instanceof AdminApiError) return { status: 'error', error: firstError, retry };

  const isPending = lessonQuery.isPending || (Boolean(rabbiId) && rabbiQuery.isPending);

  if (isPending || !lessonQuery.data) return { status: 'pending' };

  const city: SelectedCity = { id: String(lessonQuery.data.place.cityCode), name: lessonQuery.data.place.cityName };

  return {
    status: 'success',
    data: { lesson: lessonQuery.data, rabbi: rabbiQuery.data, city },
  };
};
