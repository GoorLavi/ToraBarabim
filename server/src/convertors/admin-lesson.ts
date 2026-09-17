import type { AdminOccurrenceListResponse, LessonListResponse, LessonResponse } from '@torabarabim/common';

import type { AdminOccurrenceListResult, LessonListResult, LessonRecord } from '../service/admin-lesson/models';
import { toLessonOccurrence } from './lesson';

export const toLessonResponse = (record: LessonRecord): LessonResponse => ({
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
  provenance: record.provenance,
});

export const toLessonListResponse = (result: LessonListResult): LessonListResponse => ({
  items: result.items.map(toLessonResponse),
  page: result.page,
  pageSize: result.pageSize,
  total: result.total,
});

export const toOccurrenceListResponse = (result: AdminOccurrenceListResult): AdminOccurrenceListResponse => ({
  items: result.items.map(toLessonOccurrence),
});
