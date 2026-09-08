import type { City, RabbiDetailResponse, RabbiDirectoryEntry, RabbiDirectoryResponse } from '@torabarabim/common';

import type { RabbiCityRecord, RabbiDirectoryEntryRecord, RabbiListResult } from '../service/rabbi/models';

const toCity = (record: RabbiCityRecord): City => ({
  id: String(record.code),
  name: record.nameHe,
  area: record.area,
});

const toDirectoryEntry = (record: RabbiDirectoryEntryRecord): RabbiDirectoryEntry => ({
  id: record.id,
  name: record.name,
  title: record.title,
  photoUrl: record.photoUrl,
  bio: record.bio,
  lessonCount: record.lessonCount,
  cities: record.cities.map(toCity),
});

export const toRabbiDirectoryResponse = (result: RabbiListResult): RabbiDirectoryResponse => ({
  items: result.items.map(toDirectoryEntry),
  page: result.page,
  pageSize: result.pageSize,
  total: result.total,
});

export const toRabbiDetailResponse = (result: RabbiDirectoryEntryRecord): RabbiDetailResponse => toDirectoryEntry(result);
