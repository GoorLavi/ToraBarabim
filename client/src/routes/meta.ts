import { SITE_NAME, SITE_ORIGIN } from '../../consts';
import linkPreviewImage from '../link-preview.png?no-inline';

// The entries that belong on every server-rendered page's `meta` regardless
// of which route rendered it: root.tsx (the fallback for a route exporting
// none) and every route module spread this back in, since React Router
// replaces a parent's meta array wholesale rather than merging it by key.
// Kept apart from `DEFAULT_OG_IMAGE_META` below so a route with a real
// entity photo of its own (the place page) can compose this plus its own
// `og:image` instead: appending the default image after this block would
// emit two `og:image` tags, and a scraper generally reads only the first one
// it finds.
export const SITE_WIDE_META_BASE = [
  { property: 'og:site_name', content: SITE_NAME },
  { property: 'og:locale', content: 'he_IL' },
  { name: 'twitter:card', content: 'summary_large_image' },
];

const LINK_PREVIEW_IMAGE_WIDTH = 1200;
const LINK_PREVIEW_IMAGE_HEIGHT = 630;

// The sitewide default `og:image`: the site's own logo. Every route composes
// this after `SITE_WIDE_META_BASE` except the place page, which has a real
// photo of its own and, when it has none, omits `og:image` entirely rather
// than falling back to this block.
export const DEFAULT_OG_IMAGE_META = [
  { property: 'og:image', content: `${SITE_ORIGIN}${linkPreviewImage}` },
  { property: 'og:image:width', content: String(LINK_PREVIEW_IMAGE_WIDTH) },
  { property: 'og:image:height', content: String(LINK_PREVIEW_IMAGE_HEIGHT) },
  { property: 'og:image:type', content: 'image/png' },
  { property: 'og:image:alt', content: 'הלוגו של תורה ברבים' },
];
