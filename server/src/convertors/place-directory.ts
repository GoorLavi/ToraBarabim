import type { Place, PlaceDetailResponse, PlaceListResponse, PlaceSimilarResponse } from '@torabarabim/common';

import type { PlaceListResult, PlaceRecord } from '../service/place/models';

export const toPlace = (record: PlaceRecord): Place => ({
  id: record.id,
  slug: record.slug,
  name: record.name,
  street: record.street,
  floor: record.floor,
  city: record.cityName,
  citySlug: record.citySlug,
  area: record.area,
  photoUrl: record.photoUrl,
  lessonCount: record.lessonCount,
});

export const toPlaceListResponse = (result: PlaceListResult): PlaceListResponse => ({ items: result.items.map(toPlace) });

export const toPlaceDetailResponse = (record: PlaceRecord): PlaceDetailResponse => toPlace(record);

export const toPlaceSimilarResponse = (records: PlaceRecord[]): PlaceSimilarResponse => ({ items: records.map(toPlace) });
