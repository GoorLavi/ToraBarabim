import type { RabbiLessonExceptionListResponse, RabbiLessonExceptionResponse } from '@torabarabim/common';

import type { LessonExceptionRecord } from '../service/rabbi-lesson-exception/models';

export const toRabbiLessonExceptionResponse = (record: LessonExceptionRecord): RabbiLessonExceptionResponse =>
  record.kind === 'cancelled'
    ? { id: record.id, lessonId: record.lessonId, date: record.date, kind: 'cancelled', reason: record.reason }
    : {
        id: record.id,
        lessonId: record.lessonId,
        date: record.date,
        kind: 'modified',
        startTime: record.startTime,
        place: record.place,
        substituteRabbiId: record.substituteRabbiId,
        note: record.note,
      };

export const toRabbiLessonExceptionListResponse = (records: LessonExceptionRecord[]): RabbiLessonExceptionListResponse => ({
  items: records.map(toRabbiLessonExceptionResponse),
});
