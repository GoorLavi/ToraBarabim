import type { City, RabbiDetailResponse, RabbiDirectoryEntry, RabbiDirectoryResponse } from '@torabarabim/common';

import { toCitySummary } from '../service/shared/city-summary';
import type { RabbiCityRecord, RabbiDirectoryEntryRecord, RabbiListResult } from '../service/rabbi/models';

const toCity = (record: RabbiCityRecord): City => toCitySummary(record);

const toDirectoryEntry = (record: RabbiDirectoryEntryRecord): RabbiDirectoryEntry => ({
  id: record.id,
  name: record.name,
  honorific: record.honorific,
  slug: record.slug,
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
