// Shared by useDateFilter, useSelectedCity, useSearchQuery and
// useAudienceFilter: the URL parameter names a link built on the home page
// or on /lessons both read and write, so a link handed from one to the
// other keeps working.
export const DATE_OPTION_PARAM = 'when';
export const CUSTOM_DATE_PARAM = 'date';
export const CITY_ID_PARAM = 'cityId';
export const CITY_NAME_PARAM = 'cityName';
export const SEARCH_QUERY_PARAM = 'q';
export const AUDIENCE_PARAM = 'audience';

// The one other screen, besides `/`, whose header acts in place rather than
// as a launch pad (useHeaderFilterParams.ts) and whose own audience is נשים
// derived from the path rather than a URL param (AudienceFilter.tsx).
export const WOMEN_PAGE_PATH = '/women';

// Pinned to `routes/cities.$slug/route.tsx`'s own id, so the header can read
// that route's loader data (`useRouteLoaderData`) without hand-typing the id
// a second time (plan, section 3, `client/src/routes.ts` row).
export const CITY_DETAIL_ROUTE_ID = 'routes/cities.$slug';
