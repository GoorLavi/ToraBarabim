import type { Area, LessonVenue, LessonVenuePanel } from '@torabarabim/common';

import { toSlug } from './slug';

// The columns every producer of a wire `LessonVenue` reads from a `cities` row.
export interface AddressCityRow {
  code: number;
  nameHe: string;
  area: Area;
}

// The columns every producer of a wire `LessonVenue` reads from a `places`
// row when a venue names one. `isActive` decides whether it resolves as
// `kind: 'place'` or falls back to `kind: 'address'` (see `toVenue`).
export interface AddressPlaceRow {
  id: string;
  slug: string;
  name: string;
  street: string;
  floor: string | null;
  isActive: boolean;
}

// A resolved-enough venue reference: either a place by id, or the lesson's
// (or exception's) own free text. `cityCode` is always present, on both
// arms, per the chokepoint decision on `lessons.city_code`
// (`service/shared/lesson-write.ts`'s `lessonVenueColumns`).
export type VenueRef =
  | { kind: 'place'; placeId: string; cityCode: number }
  | { kind: 'address'; name: string; street: string; floor?: string; cityCode: number };

// The one place a `VenueRef` becomes the public `LessonVenue` shape, by
// looking up its city and, for a place, the place itself. Three call sites
// (the public lesson search, the home rails, and a rabbi's own upcoming
// occurrences) built the address-only version of this by hand before
// `toAddress` existed; this is that function's successor now that a venue
// can also be a place.
//
// A deactivated place is never linked to: it resolves to its own
// last-known name and street with no id and no slug, so nothing on a
// public surface keeps pointing at a place whose own page now answers 404.
export const toVenue = (
  ref: VenueRef,
  cityByCode: Map<number, AddressCityRow>,
  placeById: Map<string, AddressPlaceRow>,
): LessonVenue => {
  const city = cityByCode.get(ref.cityCode);
  if (!city) {
    throw new Error(`data inconsistency: a venue references unknown city code ${ref.cityCode}`);
  }
  const resolvedCity = { city: city.nameHe, citySlug: toSlug(city.nameHe), area: city.area };

  if (ref.kind === 'address') {
    return { kind: 'address', name: ref.name, street: ref.street, floor: ref.floor, ...resolvedCity };
  }

  const place = placeById.get(ref.placeId);
  if (!place) {
    throw new Error(`data inconsistency: a venue references unknown place '${ref.placeId}'`);
  }
  return place.isActive
    ? { kind: 'place', placeId: place.id, slug: place.slug, name: place.name, street: place.street, floor: place.floor ?? undefined, ...resolvedCity }
    : { kind: 'address', name: place.name, street: place.street, floor: place.floor ?? undefined, ...resolvedCity };
};

// A panel's (admin or rabbi) version of `toVenue`: the same place
// resolution, including the deactivated-place fallback, but the address
// arm keeps `cityCode` alongside the resolved `cityName` instead of
// `citySlug`/`area`, so a panel that loads a lesson to edit it can
// resubmit the address without reconstructing the code from the name.
export const toVenuePanel = (
  ref: VenueRef,
  cityByCode: Map<number, AddressCityRow>,
  placeById: Map<string, AddressPlaceRow>,
): LessonVenuePanel => {
  const city = cityByCode.get(ref.cityCode);
  if (!city) {
    throw new Error(`data inconsistency: a venue references unknown city code ${ref.cityCode}`);
  }

  if (ref.kind === 'address') {
    return { kind: 'address', name: ref.name, street: ref.street, floor: ref.floor, cityCode: ref.cityCode, cityName: city.nameHe };
  }

  const place = placeById.get(ref.placeId);
  if (!place) {
    throw new Error(`data inconsistency: a venue references unknown place '${ref.placeId}'`);
  }
  return place.isActive
    ? { kind: 'place', placeId: place.id, slug: place.slug, name: place.name, street: place.street, floor: place.floor ?? undefined, city: city.nameHe, citySlug: toSlug(city.nameHe), area: city.area }
    : { kind: 'address', name: place.name, street: place.street, floor: place.floor ?? undefined, cityCode: ref.cityCode, cityName: city.nameHe };
};
