import type { Place } from '@torabarabim/common';

import type { PickedPlace } from './models';

// The result row's and the chosen control's second line: "street, city",
// literally comma-joined per the brief's own `רחוב, עיר` shape.
export const placeAddressLine = (street: string, city: string): string => `${street}, ${city}`;

// Every place a search result or a duplicate-hint match returns is active
// by construction (`GET /v1/places` and `GET /v1/places/similar` both
// filter to active places), so picking one always yields `isActive: true`.
// Selects fields explicitly rather than spreading `place`, so a field
// `Place` carries that this picker has no use for (`lessonCount`) is never
// carried along into `PickedPlace`, which does not have it.
export const toPickedPlace = (place: Place): PickedPlace => ({
  id: place.id,
  slug: place.slug,
  name: place.name,
  street: place.street,
  floor: place.floor,
  city: place.city,
  citySlug: place.citySlug,
  area: place.area,
  photoUrl: place.photoUrl,
  isActive: true,
});
