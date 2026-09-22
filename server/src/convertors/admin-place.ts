import type { AdminPlaceListResponse, AdminPlaceResponse } from '@torabarabim/common';

import type { AdminPlaceListResult, AdminPlaceRecord } from '../service/admin-place/models';

export const toAdminPlaceResponse = (record: AdminPlaceRecord): AdminPlaceResponse => ({
  id: record.id,
  slug: record.slug,
  name: record.name,
  street: record.street,
  floor: record.floor,
  cityCode: record.cityCode,
  cityName: record.cityName,
  area: record.area,
  photoUrl: record.photoUrl,
  isActive: record.isActive,
});

export const toAdminPlaceListResponse = (result: AdminPlaceListResult): AdminPlaceListResponse => ({
  items: result.items.map(toAdminPlaceResponse),
  page: result.page,
  pageSize: result.pageSize,
  total: result.total,
});
