import type { City } from '@torabarabim/common';

import type { ResolvedCity } from '../service/city/models';

export const toCity = (record: ResolvedCity): City => ({
  id: String(record.code),
  name: record.nameHe,
  area: record.area,
});

export const toCityList = (records: ResolvedCity[]): { items: City[] } => ({
  items: records.map(toCity),
});
