import type { CourseListResponse, CourseLifecycleView, CourseResponse } from '@torabarabim/common';

import type { CourseWriteRecord } from '../service/shared/course-write';
import type { CourseListResult } from '../service/shared/models';
import storage from '../storage/storage';

const toLifecycleView = (lifecycle: CourseWriteRecord['lifecycle']): CourseLifecycleView =>
  lifecycle.status === 'closed'
    ? { status: 'closed', reason: lifecycle.reason, closedOn: lifecycle.closedOn, leavesListsOn: lifecycle.leavesListsOn }
    : { status: lifecycle.status, closesOn: lifecycle.closesOn };

// The one `CourseResponse` shape both the rabbi panel and the admin panel
// receive: their two write services each return the same `CourseWriteRecord`,
// so there is exactly one place this conversion happens.
export const toCourseResponse = (record: CourseWriteRecord): CourseResponse => ({
  id: record.id,
  slug: record.slug,
  name: record.name,
  cycle: record.cycle,
  description: record.description,
  teacher: record.teacher,
  openingDate: record.openingDate,
  weeks: record.weeks,
  sessions: record.sessions,
  hours: record.hours,
  venue: record.venue,
  audience: record.audience,
  topic: record.topic,
  joinableAfterOpening: record.joinableAfterOpening,
  contactPhone: record.contactPhone,
  priceShekels: record.priceShekels,
  coverUrl: storage.publicUrl(record.coverKey),
  photos: record.photos.map((photo) => ({ id: photo.id, url: storage.publicUrl(photo.storageKey) })),
  lifecycle: toLifecycleView(record.lifecycle),
});

export const toCourseListResponse = (result: CourseListResult): CourseListResponse => ({
  items: result.items.map(toCourseResponse),
  page: result.page,
  pageSize: result.pageSize,
  total: result.total,
});
