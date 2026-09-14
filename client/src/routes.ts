import type { RouteConfig } from '@react-router/dev/routes';
import { index, layout, route } from '@react-router/dev/routes';

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
    route('cities/:cityName', 'routes/cities.$cityName.tsx'),
    route('contact', 'routes/contact.tsx'),
    route('*', 'routes/not-found.tsx'),
  ]),
  route('admin/*', 'routes/admin.tsx'),
  route('rabbi/*', 'routes/rabbi-panel.tsx'),
] satisfies RouteConfig;
