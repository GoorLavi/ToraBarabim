import type { CityDirectoryResponse } from '@torabarabim/common';

import { SITE_NAME } from '../../consts';

// Shared by every server-rendered route's loader and `headers` export.

// An error response must never sit behind the CDN's success caching (the
// spike defect: a 500 while the database was down was cached as a normal
// page for five minutes). Every loader throws a Response carrying this
// header on a failure path, and every route's `headers` falls back to it
// through `errorHeaders`.
export const UNCACHEABLE_ERROR_HEADERS = { 'Cache-Control': 'no-store' };

// The default success caching for a server-rendered document: short enough
// that a change (a rabbi's photo, today's home rows) is never stale for
// long, long enough to keep most requests off this container. Also used on
// the canonical redirect a route issues for a bare-id or stale-slug URL,
// since that redirect is exactly as fresh as the success response it points
// at.
export const PUBLIC_CACHE_HEADERS = { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' };

// home.tsx's own ErrorBoundary copy. A loader failure needs a route-level
// boundary here, not just root.tsx's, so `headers()` sees `errorHeaders` and
// keeps this route's 500 out of the CDN's success caching the same way the
// rabbi route's own boundary does.
export const HOME_ERROR_HEADING = 'לא הצלחנו לטעון את הדף';
export const HOME_ERROR_BODY = 'משהו השתבש בטעינת השיעורים. אפשר לנסות לרענן את הדף.';
export const HOME_ERROR_RELOAD_LABEL = 'רענון הדף';

// cities.tsx's own document title and description, not in-page copy:
// CitiesPage/consts.ts owns what a visitor reads on the page itself.
export const citiesPageTitle = (): string => `כל הערים | שיעורי תורה לפי עיר ואזור | ${SITE_NAME}`;

export const citiesPageDescription = (directory: CityDirectoryResponse): string => {
  const cityCount = directory.areas.reduce((total, group) => total + group.cities.length, 0);
  return `כל הערים והאזורים שיש בהם שיעורי תורה, ${cityCount} ערים בפריסה ארצית, ב${SITE_NAME}.`;
};
