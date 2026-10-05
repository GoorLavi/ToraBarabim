import type { AdminRabbiListItem, DeleteImpactPreview, RabbiListResponse, RabbiResponse } from '@torabarabim/common';

import type { DeleteRabbiPreviewResult, RabbiListItemRecord, RabbiListResult, RabbiRecord } from '../service/admin-rabbi/models';

export const toRabbiResponse = (record: RabbiRecord): RabbiResponse => ({
  id: record.id,
  name: record.name,
  honorific: record.honorific,
  slug: record.slug,
  title: record.title,
  photoUrl: record.photoUrl,
  bio: record.bio,
  prominence: record.prominence,
});

const toRabbiListItem = (record: RabbiListItemRecord): AdminRabbiListItem => ({
  ...toRabbiResponse(record),
  lessonCount: record.lessonCount,
});

export const toRabbiListResponse = (result: RabbiListResult): RabbiListResponse => ({
  items: result.items.map(toRabbiListItem),
  page: result.page,
  pageSize: result.pageSize,
  total: result.total,
});

export const toDeleteRabbiPreviewResponse = (result: DeleteRabbiPreviewResult): DeleteImpactPreview => ({
  lessonCount: result.lessonCount,
  exceptionCount: result.exceptionCount,
  courseCount: result.courseCount,
});
