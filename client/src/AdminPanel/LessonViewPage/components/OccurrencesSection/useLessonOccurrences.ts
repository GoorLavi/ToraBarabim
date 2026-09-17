import { useQuery } from '@tanstack/react-query';
import type { LessonResponse } from '@torabarabim/common';

import { AdminApiError, fetchAdminLessonExceptions, fetchAdminOccurrences } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';

import { joinOccurrencesWithExceptions } from './helpers';
import type { OccurrencesSectionState } from './models';

// Only a failed *occurrences* fetch is fatal to this section: it is the
// data the section exists to show. A failed exceptions fetch degrades to a
// still-readable, write-limited list instead (see `helpers.ts`'s
// `canWriteRow`), mirroring `useExistingLesson`'s own asymmetric treatment
// of its lesson and rabbi queries.
export const useLessonOccurrences = (lessonId: string, lesson: LessonResponse): OccurrencesSectionState => {
  const occurrencesQuery = useQuery({ queryKey: ADMIN_QUERY_KEYS.lessonOccurrences(lessonId), queryFn: () => fetchAdminOccurrences(lessonId) });
  const exceptionsQuery = useQuery({ queryKey: ADMIN_QUERY_KEYS.lessonExceptions(lessonId), queryFn: () => fetchAdminLessonExceptions(lessonId) });

  if (occurrencesQuery.error instanceof AdminApiError) {
    return { status: 'error', retry: () => void occurrencesQuery.refetch() };
  }

  if (occurrencesQuery.isPending || !occurrencesQuery.data) return { status: 'pending' };

  if (occurrencesQuery.data.items.length === 0) return { status: 'empty' };

  const exceptionsFailed = exceptionsQuery.error instanceof AdminApiError;
  if (!exceptionsFailed && exceptionsQuery.isPending) return { status: 'pending' };

  const exceptions = exceptionsFailed || !exceptionsQuery.data ? [] : exceptionsQuery.data.items;
  const rows = joinOccurrencesWithExceptions(occurrencesQuery.data.items, exceptions, lesson);

  if (exceptionsFailed) return { status: 'exceptionsUnavailable', rows, retry: () => void exceptionsQuery.refetch() };

  return { status: 'success', rows };
};
