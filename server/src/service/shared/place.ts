import type { Area, LessonPlace, Place } from '@torabarabim/common';

import { toSlug } from './slug';

// The columns every producer of a wire `Place` reads from a `cities` row.
export interface PlaceCityRow {
  code: number;
  nameHe: string;
  area: Area;
}

// The one place a lesson's (or an exception's override) `LessonPlace`
// becomes the public `Place` shape, by looking up its city, the one join a
// venue ever needs since it carries everything else as its own text. Three
// call sites (the public lesson search, the home rails, and a rabbi's own
// upcoming occurrences) built this by hand before this existed.
export const toPlace = (place: LessonPlace, cityByCode: Map<number, PlaceCityRow>): Place => {
  const city = cityByCode.get(place.cityCode);
  if (!city) {
    throw new Error(`data inconsistency: a lesson references unknown city code ${place.cityCode}`);
  }
  return {
    name: place.name,
    street: place.street,
    floor: place.floor,
    city: city.nameHe,
    citySlug: toSlug(city.nameHe),
    area: city.area,
  };
};
