import { useQuery } from '@tanstack/react-query';
import type { City, Lesson, Place, Rabbi } from '@torabarabim/common';

import { AdminApiError, fetchAdminCities, fetchAdminLesson, fetchAdminPlace, fetchAdminRabbi } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

export interface ExistingLessonData {
  lesson: Lesson;
  rabbi: Rabbi | undefined;
  place: Place | undefined;
  city: City | undefined;
}

export type ExistingLessonState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'error'; error: AdminApiError; retry: () => void }
  | { status: 'success'; data: ExistingLessonData };

// Four dependent-but-parallelizable reads for edit mode: the lesson first
// resolves `rabbiId`/`placeId`, which unlock the rabbi and place reads, and
// the place's `city` (a name only, see the report for this slice) unlocks
// a `GET /v1/cities` lookup to recover the id the `CitySelect` needs.
export const useExistingLesson = (id: string | undefined): ExistingLessonState => {
  const lessonQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.lesson(id ?? ''),
    queryFn: () => fetchAdminLesson(id as string),
    enabled: Boolean(id),
  });

  const rabbiId = lessonQuery.data?.rabbiId;
  const placeId = lessonQuery.data?.placeId;

  const rabbiQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.rabbi(rabbiId ?? ''),
    queryFn: () => fetchAdminRabbi(rabbiId as string),
    enabled: Boolean(rabbiId),
  });
  const placeQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.place(placeId ?? ''),
    queryFn: () => fetchAdminPlace(placeId as string),
    enabled: Boolean(placeId),
  });

  const cityName = placeQuery.data?.city;
  const cityQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.cities(cityName ?? ''),
    queryFn: () => fetchAdminCities(cityName as string),
    enabled: Boolean(cityName),
  });

  if (!id) return { status: 'idle' };

  const retry = (): void => {
    void lessonQuery.refetch();
  };

  const firstError = lessonQuery.error ?? rabbiQuery.error ?? placeQuery.error ?? cityQuery.error;
  if (firstError instanceof AdminApiError) return { status: 'error', error: firstError, retry };

  const isPending =
    lessonQuery.isPending ||
    (Boolean(rabbiId) && rabbiQuery.isPending) ||
    (Boolean(placeId) && placeQuery.isPending) ||
    (Boolean(cityName) && cityQuery.isPending);

  if (isPending || !lessonQuery.data) return { status: 'pending' };

  const city = cityQuery.data?.items.find((item) => item.name === cityName);

  return {
    status: 'success',
    data: { lesson: lessonQuery.data, rabbi: rabbiQuery.data, place: placeQuery.data, city },
  };
};
