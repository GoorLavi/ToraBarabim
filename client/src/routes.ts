import type { RouteConfig } from '@react-router/dev/routes';
import { index, layout, route } from '@react-router/dev/routes';

import { CITY_DETAIL_ROUTE_ID } from './hooks/consts';

export default [
  layout('routes/layout.tsx', [
    index('routes/home.tsx'),
    route('lesson/:lessonId/:date', 'routes/lesson.tsx'),
    route('lessons', 'routes/lessons.tsx'),
    route('rabbis', 'routes/rabbis.tsx'),
    // The optional trailing segment lets one route answer both the bare-id
    // URL and the slugged public one: the loader resolves by id alone and
    // 301s a missing or stale slug to the canonical URL, so a second route
    // that could drift out of step with this one is never needed.
    route('rabbis/:rabbiId/:slug?', 'routes/rabbis.$rabbiId/route.tsx'),
    route('cities', 'routes/cities.tsx'),
    // Pinned id, read by the header's audience dropdown through
    // `useRouteLoaderData(CITY_DETAIL_ROUTE_ID)` rather than a hand-typed
    // string, so the two can never drift apart.
    route('cities/:slug', 'routes/cities.$slug/route.tsx', { id: CITY_DETAIL_ROUTE_ID }),
    route('areas/:slug', 'routes/areas.$slug/route.tsx'),
    route('places', 'routes/places.tsx'),
    // The optional trailing segment mirrors rabbis/:rabbiId/:slug?: a place
    // renames itself from its own panel, so the id is the stable key and the
    // slug is decoration, resolved and redirected the same way.
    route('places/:placeId/:slug?', 'routes/places.$placeId/route.tsx'),
    route('women', 'routes/women/route.tsx'),
    route('women/rabbaniyot', 'routes/women.rabbaniyot.tsx'),
    route('contact', 'routes/contact.tsx'),
    route('*', 'routes/not-found.tsx'),
  ]),
  route('admin/*', 'routes/admin.tsx'),
  route('rabbi/*', 'routes/rabbi-panel.tsx'),
  route('place/*', 'routes/place-panel.tsx'),
  route('login', 'routes/panel-login.tsx'),
  // Outside `layout`: it renders no UI, only an XML `Response` (see
  // routes/sitemap.ts).
  route('sitemap.xml', 'routes/sitemap.ts'),
] satisfies RouteConfig;
