import type { RabbiHonorific } from '@torabarabim/common';

import { SITE_NAME, SITE_ORIGIN } from '../consts';
import linkPreviewImage from './link-preview.png?no-inline';

// Shared across the city, cities and area pages (client/src/CityPage,
// client/src/CitiesPage, client/src/AreaPage): three callers each of the
// back link and the two count labels.
export const BACK_TO_ALL_CITIES_LABEL = 'חזרה לכל הערים';

// The one Hebrew label per honorific, read by `rabbiDisplayName` (helpers.ts)
// and by every screen that lets an admin or a rabbanit's own profile show
// which one applies.
export const RABBI_HONORIFIC_LABELS: Record<RabbiHonorific, string> = {
  rav: 'הרב',
  rabbanit: 'הרבנית',
};

export const lessonCountLabel = (count: number): string => (count === 1 ? 'שיעור אחד' : `${count} שיעורים`);
export const cityCountLabel = (count: number): string => (count === 1 ? 'עיר אחת' : `${count} ערים`);

const LINK_PREVIEW_IMAGE_WIDTH = 1200;
const LINK_PREVIEW_IMAGE_HEIGHT = 630;

// The entries that belong on every page regardless of which route rendered
// it. React Router replaces a parent's meta array wholesale rather than
// merging it by key, so a route exporting its own `meta` drops everything
// root.tsx sets unless it spreads these back in, which every public route
// does. Order within the array does not matter, only that the spread is
// there. Defined here, beside the other sitewide values, because root.tsx
// and every route module need the identical list and two copies would
// drift apart silently.
//
// This lives in src/, not in client/consts.ts, because it imports the
// preview image: client/vite.config.ts imports client/consts.ts under plain
// Node to read SITE_ORIGIN, and plain Node cannot import a PNG.
export const SITE_WIDE_META = [
  { property: 'og:site_name', content: SITE_NAME },
  { property: 'og:locale', content: 'he_IL' },
  { property: 'og:image', content: `${SITE_ORIGIN}${linkPreviewImage}` },
  { property: 'og:image:width', content: String(LINK_PREVIEW_IMAGE_WIDTH) },
  { property: 'og:image:height', content: String(LINK_PREVIEW_IMAGE_HEIGHT) },
  { property: 'og:image:type', content: 'image/png' },
  { property: 'og:image:alt', content: 'הלוגו של תורה ברבים' },
  { name: 'twitter:card', content: 'summary_large_image' },
];
