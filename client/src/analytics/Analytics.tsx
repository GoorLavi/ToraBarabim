import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { MIXPANEL_EVENTS } from './consts';
import { initAnalytics, trackEvent } from './mixpanel';

// Renders nothing: this only wires Mixpanel into the route tree's lifecycle.
// Mounted from Root(), not Layout(), so its effects never run during SSR and
// only ever fire in the browser.
export const Analytics = (): null => {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackEvent(MIXPANEL_EVENTS.pageView, { path: `${location.pathname}${location.search}` });
  }, [location.pathname, location.search]);

  return null;
};
