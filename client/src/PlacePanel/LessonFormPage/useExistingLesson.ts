import { useQuery } from '@tanstack/react-query';
import type { PlaceLessonResponse, Rabbi } from '@torabarabim/common';

import { fetchLesson, fetchRabbiById, PlaceApiError } from '~/PlacePanel/api';
import { PLACE_QUERY_KEYS } from '~/PlacePanel/consts';

export type ExistingLessonState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'error'; error: PlaceApiError; retry: () => void }
  | { status: 'success'; lesson: PlaceLessonResponse; rabbi: Rabbi | undefined };

// The lesson itself and its rabbi's name are two separate reads
// (`PlaceLessonResponse` carries only the bare `rabbiId`, see
// `helpers.ts`'s `lessonToFormState`): the rabbi query is enabled only once
// the lesson has resolved, and its own pending or failed state simply
// leaves `rabbi` undefined rather than blocking the whole form, since
// `RabbiSelect` degrades to its placeholder either way.
export const useExistingLesson = (id: string | undefined): ExistingLessonState => {
  const lessonQuery = useQuery({
    queryKey: PLACE_QUERY_KEYS.lesson(id ?? ''),
    queryFn: () => fetchLesson(id as string),
    enabled: Boolean(id),
  });

  const rabbiId = lessonQuery.data?.rabbiId;
  const rabbiQuery = useQuery({
    queryKey: PLACE_QUERY_KEYS.lessonRabbi(rabbiId ?? ''),
    queryFn: () => fetchRabbiById(rabbiId as string),
    enabled: Boolean(rabbiId),
  });

  if (!id) return { status: 'idle' };
  if (lessonQuery.error instanceof PlaceApiError) return { status: 'error', error: lessonQuery.error, retry: () => void lessonQuery.refetch() };
  if (lessonQuery.isPending || !lessonQuery.data) return { status: 'pending' };
  return { status: 'success', lesson: lessonQuery.data, rabbi: rabbiQuery.data };
};
