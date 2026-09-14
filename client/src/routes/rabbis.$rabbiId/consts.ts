import type { RabbiDetailResponse } from '@torabarabim/common';

import type { JsonLdObject } from '../models';

import { SITE_NAME } from '../../../consts';

// Document title and description for search results and link previews, not
// in-page copy: RabbiPage/consts.ts owns what a visitor reads on the page
// itself.
export const pageTitle = (rabbiName: string): string => `${rabbiName} | שיעורי תורה | ${SITE_NAME}`;

export const pageDescription = (rabbi: RabbiDetailResponse): string =>
  rabbi.lessonCount > 0
    ? `השיעורים של ${rabbi.name}: מועדים, מקומות ופרטים מלאים ב${SITE_NAME}.`
    : `העמוד של ${rabbi.name} ב${SITE_NAME}, מנוע החיפוש לשיעורי תורה לפי רב, מקום ותאריך.`;

// Structured data for the rabbi page. `description` and `image` are omitted
// entirely when the rabbi has no bio or photo: a placeholder value would be
// a factual claim about a real person that the data does not support.
export const personJsonLd = (rabbi: RabbiDetailResponse, url: string): JsonLdObject => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: rabbi.name,
  url,
  ...(rabbi.bio ? { description: rabbi.bio } : {}),
  ...(rabbi.photoUrl ? { image: rabbi.photoUrl } : {}),
});
