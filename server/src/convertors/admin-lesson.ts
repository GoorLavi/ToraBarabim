import type { LessonListResponse, LessonResponse } from '@torabarabim/common';

import type { LessonListResult, LessonRecord } from '../service/admin-lesson/models';

export const toLessonResponse = (record: LessonRecord): LessonResponse => ({
  id: record.id,
  title: record.title,
  rabbiId: record.rabbiId,
  placeId: record.placeId,
  topic: record.topic,
  audience: record.audience,
  recurrence: record.recurrence,
  startTime: record.startTime,
  durationMinutes: record.durationMinutes,
  notes: record.notes,
});

export const toLessonListResponse = (result: LessonListResult): LessonListResponse => ({
  items: result.items.map(toLessonResponse),
  page: result.page,
  pageSize: result.pageSize,
  total: result.total,
});
