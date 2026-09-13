import type { RouteConfig } from '@react-router/dev/routes';
import { index, layout, route } from '@react-router/dev/routes';

export default [
  layout('routes/layout.tsx', [
    index('routes/home.tsx'),
    route('lesson/:lessonId/:date', 'routes/lesson.tsx'),
    route('lessons', 'routes/lessons.tsx'),
    route('rabbis', 'routes/rabbis.tsx'),
    // The one route with a loader and a meta in this migration; every
    // sibling above still fetches client-side through react-query.
    route('rabbis/:rabbiId', 'routes/rabbis.$rabbiId/route.tsx'),
    route('cities', 'routes/cities.tsx'),
    route('cities/:cityName', 'routes/cities.$cityName.tsx'),
    route('contact', 'routes/contact.tsx'),
    route('*', 'routes/not-found.tsx'),
  ]),
  route('admin/*', 'routes/admin.tsx'),
  route('rabbi/*', 'routes/rabbi-panel.tsx'),
] satisfies RouteConfig;
