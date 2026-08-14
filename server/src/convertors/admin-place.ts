import type { DeleteImpactPreview, PlaceListResponse, PlaceResponse } from '@torabarabim/common';

import type { DeletePlacePreviewResult, PlaceListResult, PlaceRecord } from '../service/admin-place/models';

export const toPlaceResponse = (record: PlaceRecord): PlaceResponse => ({
  id: record.id,
  name: record.name,
  address: record.address,
  city: record.city,
  area: record.area,
});

export const toPlaceListResponse = (result: PlaceListResult): PlaceListResponse => ({
  items: result.items.map(toPlaceResponse),
  page: result.page,
  pageSize: result.pageSize,
  total: result.total,
});

export const toDeletePlacePreviewResponse = (result: DeletePlacePreviewResult): DeleteImpactPreview => ({
  lessonCount: result.lessonCount,
  exceptionCount: result.exceptionCount,
});
