import type { RabbiCreateLessonExceptionRequest, RabbiLessonExceptionResponse } from '@torabarabim/common';

import { createLessonException, deleteLessonException, fetchLessonExceptions, RabbiApiError, updateLessonException } from '~/RabbiPanel/api';

const findExceptionId = async (lessonId: string, date: string): Promise<number | undefined> => {
  const { items } = await fetchLessonExceptions(lessonId);
  return items.find((item) => item.date === date)?.id;
};

// `GET /v1/rabbi/occurrences` is a resolved read model with no exception
// id to address (`LessonOccurrence` never carries one), so writing an
// occurrence's exception has to create it first and only fall back to
// looking its id up when one already exists for that date: a 409
// `duplicate_exception` on `POST` (cancelling an already-moved date, or
// moving an already-moved one again), retried once as a `PATCH`.
export const upsertOccurrenceException = async (
  lessonId: string,
  date: string,
  body: RabbiCreateLessonExceptionRequest,
): Promise<RabbiLessonExceptionResponse> => {
  try {
    return await createLessonException(lessonId, body);
  } catch (error) {
    if (error instanceof RabbiApiError && error.code === 'duplicate_exception') {
      const exceptionId = await findExceptionId(lessonId, date);
      if (exceptionId !== undefined) return await updateLessonException(lessonId, exceptionId, body);
    }
    throw error;
  }
};

// Restoring a cancelled or moved occurrence removes its exception
// entirely, returning it to whatever the lesson's own recurrence says. A
// date with no exception at all is treated as already restored rather than
// an error.
export const removeOccurrenceException = async (lessonId: string, date: string): Promise<void> => {
  const exceptionId = await findExceptionId(lessonId, date);
  if (exceptionId === undefined) return;
  await deleteLessonException(lessonId, exceptionId);
};
