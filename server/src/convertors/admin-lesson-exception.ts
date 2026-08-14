import type { LessonExceptionListResponse, LessonExceptionResponse } from '@torabarabim/common';

import type { LessonExceptionRecord } from '../service/admin-lesson-exception/models';

export const toLessonExceptionResponse = (record: LessonExceptionRecord): LessonExceptionResponse =>
  record.kind === 'cancelled'
    ? { id: record.id, lessonId: record.lessonId, date: record.date, kind: 'cancelled', reason: record.reason }
    : {
        id: record.id,
        lessonId: record.lessonId,
        date: record.date,
        kind: 'modified',
        startTime: record.startTime,
        placeId: record.placeId,
        substituteRabbiId: record.substituteRabbiId,
        note: record.note,
      };

export const toLessonExceptionListResponse = (records: LessonExceptionRecord[]): LessonExceptionListResponse => ({
  items: records.map(toLessonExceptionResponse),
});
