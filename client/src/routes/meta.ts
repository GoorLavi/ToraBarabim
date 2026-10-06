import { SITE_NAME, SITE_ORIGIN } from '../../consts';
import linkPreviewImage from '../link-preview.png?no-inline';

// The entries that belong on every server-rendered page's `meta` regardless
// of which route rendered it: root.tsx (the fallback for a route exporting
// none) and every route module spread this back in, since React Router
// replaces a parent's meta array wholesale rather than merging it by key.
// Carries no image and no `twitter:card`, both of which follow the image: a
// route with a default image spreads `DEFAULT_OG_IMAGE_META` after this, a
// route with an entity image of its own spreads `entityImageMeta`. Appending
// both would emit two `og:image` tags and two cards, and a scraper generally
// reads only the first one it finds.
export const SITE_WIDE_META_BASE = [
  { property: 'og:site_name', content: SITE_NAME },
  { property: 'og:locale', content: 'he_IL' },
];

const LARGE_IMAGE_CARD = { name: 'twitter:card', content: 'summary_large_image' };
const NO_IMAGE_CARD = { name: 'twitter:card', content: 'summary' };

const LINK_PREVIEW_IMAGE_WIDTH = 1200;
const LINK_PREVIEW_IMAGE_HEIGHT = 630;

// The sitewide default `og:image`: the site's own logo, with the large card
// that fits it. Every route without an image of its own composes this after
// `SITE_WIDE_META_BASE`; the entity pages (lesson, rabbi, place, course)
// compose `entityImageMeta` instead and never fall back to the logo.
export const DEFAULT_OG_IMAGE_META = [
  { property: 'og:image', content: `${SITE_ORIGIN}${linkPreviewImage}` },
  { property: 'og:image:width', content: String(LINK_PREVIEW_IMAGE_WIDTH) },
  { property: 'og:image:height', content: String(LINK_PREVIEW_IMAGE_HEIGHT) },
  { property: 'og:image:type', content: 'image/png' },
  { property: 'og:image:alt', content: 'הלוגו של תורה ברבים' },
  LARGE_IMAGE_CARD,
];

// A page about one real thing previews with that thing's own photo or with
// nothing, never with the logo: a logo under a rabbi's name is a claim the
// data does not support. The card follows the image, so a page with no
// photo asks for the small `summary` card instead of a large one with a
// hole in it. No width or height: a stored photo carries neither, and a
// wrong one is worse than none.
export const entityImageMeta = (imageUrl: string | undefined) =>
  imageUrl ? [{ property: 'og:image', content: imageUrl }, LARGE_IMAGE_CARD] : [NO_IMAGE_CARD];
