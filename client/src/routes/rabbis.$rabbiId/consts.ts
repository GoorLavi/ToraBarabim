import type { RabbiDetailResponse } from '@torabarabim/common';

import type { JsonLdObject } from '../models';

import { RABBI_HONORIFIC_LABELS } from '~/consts';
import { rabbiDisplayName } from '~/helpers';

import { SITE_NAME } from '../../../consts';

// Document title and description for search results and link previews, not
// in-page copy: RabbiPage/consts.ts owns what a visitor reads on the page
// itself. Fed the already-composed "הרב <name>" / "הרבנית <name>" string by
// its caller (route.tsx), so this file never has to know how the honorific
// is chosen.
export const pageTitle = (composedRabbiName: string): string => `${composedRabbiName} | שיעורי תורה | ${SITE_NAME}`;

export const pageDescription = (rabbi: RabbiDetailResponse): string => {
  const composedRabbiName = rabbiDisplayName(rabbi);
  return rabbi.lessonCount > 0
    ? `השיעורים של ${composedRabbiName}: מועדים, מקומות ופרטים מלאים ב${SITE_NAME}.`
    : `העמוד של ${composedRabbiName} ב${SITE_NAME}, מנוע החיפוש לשיעורי תורה לפי רב, מקום ותאריך.`;
};

// Structured data for the rabbi page. `name` stays the bare name per
// schema.org's `Person` convention, with `honorificPrefix` carrying the
// Hebrew honorific separately. `description` and `image` are omitted
// entirely when the rabbi has no bio or photo: a placeholder value would be
// a factual claim about a real person that the data does not support.
export const personJsonLd = (rabbi: RabbiDetailResponse, url: string): JsonLdObject => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: rabbi.name,
  honorificPrefix: RABBI_HONORIFIC_LABELS[rabbi.honorific],
  url,
  ...(rabbi.bio ? { description: rabbi.bio } : {}),
  ...(rabbi.photoUrl ? { image: rabbi.photoUrl } : {}),
});
