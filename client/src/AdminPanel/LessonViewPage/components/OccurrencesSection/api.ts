import type { CreateLessonExceptionRequest, LessonExceptionResponse } from '@torabarabim/common';

import { createAdminLessonException, updateAdminLessonException } from '~/AdminPanel/api';

// The occurrence list is already joined against the exceptions list by date
// (`helpers.ts`'s `joinOccurrencesWithExceptions`), so unlike the rabbi
// panel's version of this action (`RabbiPanel/UpcomingPage/api.ts`'s
// `upsertOccurrenceException`) the caller already knows whether a date's
// exception exists and what its id is: no create-then-retry-as-update on a
// 409 is needed here.
export const saveOccurrenceException = (
  lessonId: string,
  existingExceptionId: number | undefined,
  body: CreateLessonExceptionRequest,
): Promise<LessonExceptionResponse> =>
  existingExceptionId === undefined ? createAdminLessonException(lessonId, body) : updateAdminLessonException(lessonId, existingExceptionId, body);
