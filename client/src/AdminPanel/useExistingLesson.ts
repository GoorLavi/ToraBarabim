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

// The venue is on the lesson itself now (`lesson.venue`), so no place fetch
// is needed to load an existing lesson: just the lesson, then the rabbi it
// unlocks.
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

  // Refetches both, not just the lesson: a rabbi failure is non-fatal below,
  // but it is still a failure, and if retry skipped that query there would be
  // no way at all to recover the rabbi from this screen short of a remount.
  const retry = (): void => {
    void lessonQuery.refetch();
    if (rabbiId) void rabbiQuery.refetch();
  };

  // Only a failed *lesson* fetch is fatal to this screen: a rabbi that fails
  // to resolve degrades to `rabbi: undefined` below instead, which
  // `LessonViewPage` already renders correctly. Folding `rabbiQuery.error` in
  // here used to blank the whole page on a rabbi-fetch failure, behind a
  // retry button that refetched the wrong query and so could never fix it.
  if (lessonQuery.error instanceof AdminApiError) return { status: 'error', error: lessonQuery.error, retry };

  const isPending = lessonQuery.isPending || (Boolean(rabbiId) && rabbiQuery.isPending);

  if (isPending || !lessonQuery.data) return { status: 'pending' };

  // `LessonResponse.venue` is `LessonVenuePanel`: only the address arm
  // carries a numeric `cityCode`, the id `CitySelect` needs. The place arm
  // has nothing valid to prefill it with (its `placeId` is for a picker
  // that does not exist yet, Wave 5/6). City starts unset for a
  // place-backed lesson, and `validateLessonForm` requires the admin to
  // reselect it rather than let a form built for a free-text address
  // quietly resubmit one that happens to share the place's current city.
  const city: SelectedCity | undefined =
    lessonQuery.data.venue.kind === 'address' ? { id: String(lessonQuery.data.venue.cityCode), name: lessonQuery.data.venue.cityName } : undefined;

  return {
    status: 'success',
    data: { lesson: lessonQuery.data, rabbi: rabbiQuery.data, city },
  };
};
