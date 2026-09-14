import type { Mixpanel } from 'mixpanel-browser';

import { MIXPANEL_PROJECT_TOKEN } from '../../consts';

// `mixpanel-browser` touches `window`/`document` at import time, and this
// module is imported by components that render during SSR (SearchField,
// CityPicker, DateFilterChips, LessonCard). A static top-level import would
// pull the SDK into the server render and risk crashing it, so it is loaded
// dynamically, only once we already know we are in the browser.
//
// Fails closed in dev: `import.meta.env.PROD` is true only in a built
// bundle, never under the Vite dev server, so a local session never reports
// into the real Mixpanel project. Mirrors the same guard the Cloudflare tag
// used before it.
let mixpanelInstance: Mixpanel | null = null;
let initStarted = false;
const queuedEvents: Array<{ name: string; props?: Record<string, unknown> }> = [];

export const initAnalytics = (): void => {
  if (typeof window === 'undefined' || !import.meta.env.PROD || initStarted) return;
  initStarted = true;

  void import('mixpanel-browser').then(({ default: mixpanel }) => {
    mixpanel.init(MIXPANEL_PROJECT_TOKEN, { track_pageview: false, persistence: 'localStorage' });
    mixpanelInstance = mixpanel;
    queuedEvents.splice(0).forEach(({ name, props }) => mixpanelInstance?.track(name, props));
  });
};

// Queues a call made before `initAnalytics` finishes its dynamic import,
// rather than dropping it, so an event fired on the very first render (a
// page view, a fast interaction) is not silently lost.
export const trackEvent = (name: string, props?: Record<string, unknown>): void => {
  if (typeof window === 'undefined' || !import.meta.env.PROD) return;
  if (mixpanelInstance) {
    mixpanelInstance.track(name, props);
    return;
  }
  queuedEvents.push({ name, props });
};
