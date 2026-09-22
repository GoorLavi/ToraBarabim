import type { Place } from '@torabarabim/common';

import { addressLine } from '~/helpers';

const collator = new Intl.Collator('he');

// Ordering per the build brief: city by Hebrew collation, then name, then
// id. NOT IMPLEMENTED: the brief's primary key, "has-lessons first".
// `Place`/`PlaceListResponse` (common/src/venue.ts) carries no lesson count
// or has-lessons flag, and there is no cheap way to derive one client-side:
// a request per place is the "never query in a loop" rule applied to the
// browser, and fetching the whole, date-expanded occurrence set just to
// build a places lookup is the same problem in a different shape. This is
// a server-side gap, flagged in the build report rather than worked around
// here.
export const sortPlaces = (places: Place[]): Place[] =>
  [...places].sort((a, b) => collator.compare(a.city, b.city) || collator.compare(a.name, b.name) || collator.compare(a.id, b.id));

// Local, case-insensitive substring match against the place name, mirroring
// RabbisPage/helpers.ts's own filterRabbisByName (with no honorific prefix
// to strip: a place name carries none).
export const filterPlacesByName = (places: Place[], query: string): Place[] => {
  const needle = query.trim().toLowerCase();
  if (!needle) return places;
  return places.filter((place) => place.name.toLowerCase().includes(needle));
};

// "רחוב ומספר, עיר" (design spec, "Line 2"): street (with its floor, via
// the shared `addressLine`, never re-concatenated here) then the city. The
// brief's own template line also appends "· N שיעורים", omitted here for
// the same reason `sortPlaces` above cannot rank by lesson count: the data
// does not exist on `Place` yet.
export const placeRowMetaLine = (place: Place): string => `${addressLine(place.street, place.floor)}, ${place.city}`;
