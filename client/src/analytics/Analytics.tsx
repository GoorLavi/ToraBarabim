import { useEffect, useRef } from 'react';
import { useLocation, useMatches } from 'react-router';

import { MIXPANEL_EVENTS } from './consts';
import type { AppSurface } from './consts';
import { appSurfaceFor, routePattern } from './helpers';
import { initAnalytics, registerSuperProperties, trackEvent } from './mixpanel';

// Renders nothing: this only wires Mixpanel into the route tree's lifecycle.
// Mounted from Root(), not Layout(), so its effects never run during SSR and
// only ever fire in the browser. `useMatches()`, never `useParams()`: this
// component is a sibling of `<Outlet/>` in root.tsx, so `useParams()` here
// sees nothing, and `routePattern` would silently degrade to the raw path.
export const Analytics = (): null => {
  const location = useLocation();
  const matches = useMatches();
  const matchesRef = useRef(matches);
  matchesRef.current = matches;
  const lastAppSurfaceRef = useRef<AppSurface | undefined>(undefined);

  useEffect(() => {
    initAnalytics();
  }, []);

  // `matches` is read from the ref above, not listed as a dependency:
  // `useMatches()` is memoised on `loaderData`, which React Router replaces
  // on every completed navigation, including one that lands back on the
  // current URL (`LessonsPage.tsx`'s `setSearchParams({})`), so keying this
  // effect on `matches` would fire a second `Page View` for the same visit.
  useEffect(() => {
    const params = matchesRef.current.reduce<Record<string, string | undefined>>((all, match) => ({ ...all, ...match.params }), {});
    const pattern = routePattern(location.pathname, params);

    const appSurface = appSurfaceFor(location.pathname);
    if (lastAppSurfaceRef.current !== appSurface) {
      lastAppSurfaceRef.current = appSurface;
      registerSuperProperties({ appSurface });
    }

    trackEvent(MIXPANEL_EVENTS.pageView, { path: `${location.pathname}${location.search}`, routePattern: pattern });
  }, [location.pathname, location.search]);

  return null;
};
