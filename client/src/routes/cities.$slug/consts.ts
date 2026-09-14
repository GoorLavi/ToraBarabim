import type { CityDetailResponse } from '@torabarabim/common';

import { SITE_NAME } from '../../../consts';

// Document title and description for search results and link previews, not
// in-page copy: CityPage/consts.ts owns what a visitor reads on the page
// itself.
export const pageTitle = (cityName: string): string => `שיעורי תורה ב${cityName} | ${SITE_NAME}`;

export const pageDescription = (city: CityDetailResponse): string =>
  city.rabbis.length > 0
    ? `שיעורי תורה ב${city.name}: מועדים, מקומות ורבנים מלמדים, ב${SITE_NAME}.`
    : `העמוד של ${city.name} ב${SITE_NAME}, מנוע החיפוש לשיעורי תורה לפי רב, מקום ותאריך.`;
