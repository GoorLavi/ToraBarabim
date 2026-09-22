import type { PlaceProfileResponse } from '@torabarabim/common';

import type { PlaceProfileRecord } from '../service/place-portal/models';

export const toPlaceProfileResponse = (record: PlaceProfileRecord): PlaceProfileResponse => ({
  id: record.id,
  slug: record.slug,
  name: record.name,
  street: record.street,
  floor: record.floor,
  cityCode: record.cityCode,
  cityName: record.cityName,
  area: record.area,
  photoUrl: record.photoUrl,
});
