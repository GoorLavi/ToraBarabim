import type { RabbiDetailResponse } from '@torabarabim/common';

import { SITE_NAME } from '../../../consts';

// Document title and description for search results and link previews, not
// in-page copy: RabbiPage/consts.ts owns what a visitor reads on the page
// itself.
export const pageTitle = (rabbiName: string): string => `${rabbiName} | שיעורי תורה | ${SITE_NAME}`;

export const pageDescription = (rabbi: RabbiDetailResponse): string =>
  rabbi.lessonCount > 0
    ? `השיעורים של ${rabbi.name}: מועדים, מקומות ופרטים מלאים ב${SITE_NAME}.`
    : `העמוד של ${rabbi.name} ב${SITE_NAME}, מנוע החיפוש לשיעורי תורה לפי רב, מקום ותאריך.`;
