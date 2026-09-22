import type { Area, LessonAddress, ResolvedAddress } from '@torabarabim/common';

import { toSlug } from './slug';

// The columns every producer of a wire `ResolvedAddress` reads from a `cities` row.
export interface AddressCityRow {
  code: number;
  nameHe: string;
  area: Area;
}

// The one place a lesson's (or an exception's override) `LessonAddress`
// becomes the public `ResolvedAddress` shape, by looking up its city, the
// one join an address ever needs since it carries everything else as its
// own text. Three call sites (the public lesson search, the home rails, and
// a rabbi's own upcoming occurrences) built this by hand before this existed.
export const toAddress = (address: LessonAddress, cityByCode: Map<number, AddressCityRow>): ResolvedAddress => {
  const city = cityByCode.get(address.cityCode);
  if (!city) {
    throw new Error(`data inconsistency: a lesson references unknown city code ${address.cityCode}`);
  }
  return {
    name: address.name,
    street: address.street,
    floor: address.floor,
    city: city.nameHe,
    citySlug: toSlug(city.nameHe),
    area: city.area,
  };
};
