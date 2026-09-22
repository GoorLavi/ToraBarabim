import type { PlaceDetailResponse } from '@torabarabim/common';

import { LESSON_LIST_PAGE_SIZE } from '~/consts';

import type { JsonLdObject } from '../models';

import { SITE_NAME } from '../../../consts';

// The per-place loader's own page size for the occurrence search seeded on
// first paint. Reads the same threshold CityPage's own list uses
// (`~/consts`, `LESSON_LIST_PAGE_SIZE`) rather than defining a second one,
// so this loader and PlacePage's own "load more" hook agree on it without
// either importing from the other.
export const PLACE_LESSONS_PAGE_SIZE = LESSON_LIST_PAGE_SIZE;

// Document title and description for search results and link previews, not
// in-page copy: PlacePage/consts.ts owns what a visitor reads on the page
// itself. `של`, never a prefixed `ב`: a place name is free text, so `ב<name>`
// can read as a grammar or a meaning error depending on the name.
export const pageTitle = (placeName: string, cityName: string): string => `${placeName}, ${cityName} | שיעורי תורה | ${SITE_NAME}`;

export const pageDescription = (place: PlaceDetailResponse): string =>
  `השיעורים של ${place.name}, ${place.street}, ${place.city}: מועדים, רבנים ופרטים מלאים ב${SITE_NAME}.`;

// Structured data for the place page. `image` is omitted entirely when the
// place has no photo, mirroring the page's own `og:image` (route.tsx): a
// placeholder value would be a factual claim about a real venue the data
// does not support.
export const placeJsonLd = (place: PlaceDetailResponse, url: string): JsonLdObject => ({
  '@context': 'https://schema.org',
  '@type': 'Place',
  name: place.name,
  url,
  address: {
    '@type': 'PostalAddress',
    streetAddress: place.street,
    addressLocality: place.city,
    addressCountry: 'IL',
  },
  ...(place.photoUrl ? { image: place.photoUrl } : {}),
});
