import type { AreaDetailResponse } from '@torabarabim/common';

import { SITE_NAME } from '../../../consts';

// Document title and description for search results and link previews, not
// in-page copy: AreaPage/consts.ts owns what a visitor reads on the page
// itself.
export const pageTitle = (areaName: string): string => `שיעורי תורה באזור ${areaName} | ${SITE_NAME}`;

export const pageDescription = (area: AreaDetailResponse): string =>
  area.cities.length > 0
    ? `שיעורי תורה באזור ${area.areaName}: ערים, רבנים ומועדים, ב${SITE_NAME}.`
    : `העמוד של אזור ${area.areaName} ב${SITE_NAME}, מנוע החיפוש לשיעורי תורה לפי רב, מקום ותאריך.`;
