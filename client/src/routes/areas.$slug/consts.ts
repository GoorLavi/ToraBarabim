import type { AreaDetailResponse } from '@torabarabim/common';

import { cityPath } from '~/helpers';

import type { JsonLdObject } from '../models';

import { SITE_NAME, SITE_ORIGIN } from '../../../consts';

// Document title and description for search results and link previews, not
// in-page copy: AreaPage/consts.ts owns what a visitor reads on the page
// itself.
export const pageTitle = (areaName: string): string => `שיעורי תורה באזור ${areaName} | ${SITE_NAME}`;

export const pageDescription = (area: AreaDetailResponse): string =>
  area.cities.length > 0
    ? `שיעורי תורה באזור ${area.areaName}: ערים, רבנים ומועדים, ב${SITE_NAME}.`
    : `העמוד של אזור ${area.areaName} ב${SITE_NAME}, מנוע החיפוש לשיעורי תורה לפי רב, מקום ותאריך.`;

// Structured data for the area page: every city in the area, each with its
// canonical URL (`cityPath`), mirroring cities.tsx's citiesItemListJsonLd.
export const citiesItemListJsonLd = (area: AreaDetailResponse): JsonLdObject => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: area.cities.map((city, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${SITE_ORIGIN}${cityPath(city)}`,
    name: city.name,
  })),
});
