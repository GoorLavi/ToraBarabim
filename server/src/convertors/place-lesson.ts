import type { PlaceLessonListResponse, PlaceLessonResponse } from '@torabarabim/common';

import type { PlaceLessonListResult, PlaceLessonRecord } from '../service/place-portal/models';

export const toPlaceLessonResponse = (record: PlaceLessonRecord): PlaceLessonResponse => ({
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

export const toPlaceLessonListResponse = (result: PlaceLessonListResult): PlaceLessonListResponse => ({
  items: result.items.map(toPlaceLessonResponse),
  page: result.page,
  pageSize: result.pageSize,
  total: result.total,
});
