import type { DeleteImpactPreview, RabbiListResponse, RabbiResponse } from '@torabarabim/common';

import type { DeleteRabbiPreviewResult, RabbiListResult, RabbiRecord } from '../service/admin-rabbi/models';

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

export const toRabbiListResponse = (result: RabbiListResult): RabbiListResponse => ({
  items: result.items.map(toRabbiResponse),
  page: result.page,
  pageSize: result.pageSize,
  total: result.total,
});

export const toDeleteRabbiPreviewResponse = (result: DeleteRabbiPreviewResult): DeleteImpactPreview => ({
  lessonCount: result.lessonCount,
  exceptionCount: result.exceptionCount,
  // Wired to a real count once `admin-course`'s cascade lands in this
  // slice's next milestone; the courses table does not exist yet.
  courseCount: 0,
});
