import type { DeleteImpactPreview, RabbiListResponse, RabbiResponse } from '@torabarabim/common';

import type { DeleteRabbiPreviewResult, RabbiListResult, RabbiRecord } from '../service/admin-rabbi/models';

export const toRabbiResponse = (record: RabbiRecord): RabbiResponse => ({
  id: record.id,
  name: record.name,
  title: record.title,
  photoUrl: record.photoUrl,
  bio: record.bio,
});

export const toRabbiListResponse = (result: RabbiListResult): RabbiListResponse => ({
  items: result.items.map(toRabbiResponse),
  page: result.page,
  pageSize: result.pageSize,
  total: result.total,
});

export const toDeleteRabbiPreviewResponse = (result: DeleteRabbiPreviewResult): DeleteImpactPreview => ({
  lessonCount: result.lessonCount,
  exceptionCount: result.exceptionCount,
});
