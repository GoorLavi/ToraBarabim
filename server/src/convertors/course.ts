import type { CourseDetailResponse, CourseDetailState, CourseState, CourseSummary } from '@torabarabim/common';

import type { CourseLifecycleResult } from '../service/course/lifecycle';
import type { CourseDetailRecord, CourseSummaryRecord } from '../service/course/models';
import storage from '../storage/storage';

const toCourseState = (lifecycle: CourseLifecycleResult): CourseState =>
  lifecycle.status === 'closed' ? { status: 'closed', reason: lifecycle.reason, closedOn: lifecycle.closedOn } : { status: lifecycle.status };

export const toCourseSummary = (record: CourseSummaryRecord): CourseSummary => ({
  id: record.id,
  slug: record.slug,
  name: record.name,
  cycle: record.cycle,
  coverUrl: storage.publicUrl(record.coverKey),
  openingDate: record.openingDate,
  state: toCourseState(record.lifecycle),
  teacher: record.teacher,
  venue: record.venue,
  audience: record.audience,
});

// `contactPhone` is present only while registration is open: once closed,
// the actions it would drive are hidden, so it never reaches the wire for
// a closed course.
const toCourseDetailState = (lifecycle: CourseLifecycleResult, contactPhone: string): CourseDetailState =>
  lifecycle.status === 'closed' ? { status: 'closed', reason: lifecycle.reason, closedOn: lifecycle.closedOn } : { status: lifecycle.status, contactPhone };

export const toCourseDetailResponse = (record: CourseDetailRecord): CourseDetailResponse => ({
  ...toCourseSummary(record),
  state: toCourseDetailState(record.lifecycle, record.contactPhone),
  description: record.description,
  weeks: record.weeks,
  sessions: record.sessions,
  hours: record.hours,
  priceShekels: record.priceShekels,
  photos: record.photos.map((photo) => ({ id: photo.id, url: storage.publicUrl(photo.storageKey) })),
});
