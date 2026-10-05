import type { AdminLessonListResponse, AdminOccurrenceListResponse, LessonResponse } from '@torabarabim/common';

import type { AdminOccurrenceListResult, LessonListResult, LessonRecord } from '../service/admin-lesson/models';
import { toLessonOccurrence } from './lesson';

export const toLessonResponse = (record: LessonRecord): LessonResponse => ({
  id: record.id,
  title: record.title,
  rabbiId: record.rabbiId,
  venue: record.venue,
  topic: record.topic,
  audience: record.audience,
  recurrence: record.recurrence,
  startTime: record.startTime,
  durationMinutes: record.durationMinutes,
  notes: record.notes,
  provenance: record.provenance,
});

export const toAdminLessonListResponse = (result: LessonListResult): AdminLessonListResponse => ({
  items: result.items.map((item) => ({ ...toLessonResponse(item), rabbi: item.rabbi })),
  page: result.page,
  pageSize: result.pageSize,
  total: result.total,
});

export const toOccurrenceListResponse = (result: AdminOccurrenceListResult): AdminOccurrenceListResponse => ({
  items: result.items.map(toLessonOccurrence),
});
