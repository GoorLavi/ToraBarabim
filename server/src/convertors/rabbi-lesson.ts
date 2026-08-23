import type { RabbiLessonListResponse, RabbiLessonResponse } from '@torabarabim/common';

import type { RabbiLessonListResult, RabbiLessonRecord } from '../service/rabbi-lesson/models';

export const toRabbiLessonResponse = (record: RabbiLessonRecord): RabbiLessonResponse => ({
  id: record.id,
  title: record.title,
  rabbiId: record.rabbiId,
  place: record.place,
  topic: record.topic,
  audience: record.audience,
  recurrence: record.recurrence,
  startTime: record.startTime,
  durationMinutes: record.durationMinutes,
  notes: record.notes,
});

export const toRabbiLessonListResponse = (result: RabbiLessonListResult): RabbiLessonListResponse => ({
  items: result.items.map(toRabbiLessonResponse),
  page: result.page,
  pageSize: result.pageSize,
  total: result.total,
});
