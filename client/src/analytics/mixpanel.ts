import mixpanel from 'mixpanel-browser';

import { MIXPANEL_PROJECT_TOKEN } from '../../consts';

// Fails closed in dev: `import.meta.env.PROD` is true only in a built
// bundle, never under the Vite dev server, so a local session never reports
// into the real Mixpanel project. Mirrors the same guard the Cloudflare tag
// used before it.
let isInitialized = false;

export const initAnalytics = (): void => {
  if (!import.meta.env.PROD || isInitialized) return;
  mixpanel.init(MIXPANEL_PROJECT_TOKEN, { track_pageview: false, persistence: 'localStorage' });
  isInitialized = true;
};

export const trackEvent = (name: string, props?: Record<string, unknown>): void => {
  if (!isInitialized) return;
  mixpanel.track(name, props);
};
