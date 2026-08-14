import type { LessonOccurrence, LessonSearchResponse } from '@torabarabim/common';

import type { LessonSearchResult, ResolvedLessonOccurrence } from '../service/lesson/models';

export const toLessonOccurrence = (record: ResolvedLessonOccurrence): LessonOccurrence => ({
  lessonId: record.lessonId,
  date: record.date,
  startTime: record.startTime,
  endTime: record.endTime,
  status: record.status,
  title: record.title,
  topic: record.topic,
  audience: record.audience,
  rabbi: record.rabbi,
  place: record.place,
  substituteRabbi: record.substituteRabbi,
  cancellationReason: record.cancellationReason,
  note: record.note,
});

export const toLessonSearchResponse = (result: LessonSearchResult): LessonSearchResponse => ({
  items: result.items.map(toLessonOccurrence),
  page: result.page,
  pageSize: result.pageSize,
  total: result.total,
});
