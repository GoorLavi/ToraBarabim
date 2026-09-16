import type { Mixpanel } from 'mixpanel-browser';

import { BREAKPOINTS } from '~/theme/tokens';

import { MIXPANEL_PROJECT_TOKEN } from '../../consts';
import { MIXPANEL_QUEUE_CAP } from './consts';
import type { AnalyticsEventName, AnalyticsEventProps, SuperProperties } from './models';

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
// Fail open: an ad blocker (decision 0025) rejects the dynamic import below.
// Once that happens, tracking simply stops for the rest of the session
// rather than the page doing anything the visitor would notice.
let isUnavailable = false;
const queuedEvents: Array<{ name: string; props?: Parameters<Mixpanel['track']>[1] }> = [];
let pendingSuperProperties: Partial<SuperProperties> = {};

// Read once per session, on purpose: a session that starts in portrait and
// rotates keeps reporting its starting viewport rather than re-registering
// on a `matchMedia` change, since a rotation mid-session is rare enough
// that the extra listener and cleanup are not worth it here.
const readViewport = (): SuperProperties['viewport'] =>
  window.matchMedia(`(min-width: ${BREAKPOINTS.md})`).matches ? 'desktop' : 'mobile';

export const initAnalytics = (): void => {
  if (typeof window === 'undefined' || !import.meta.env.PROD || initStarted) return;
  initStarted = true;

  void import('mixpanel-browser')
    .then(({ default: mixpanel }) => {
      mixpanel.init(MIXPANEL_PROJECT_TOKEN, {
        track_pageview: false,
        persistence: 'localStorage',
        api_host: 'https://api-eu.mixpanel.com',
      });
      mixpanelInstance = mixpanel;

      // Registered before the queue below is flushed, or the first page
      // view of a session, the one most likely to still be queued, would
      // ship with no super properties at all.
      pendingSuperProperties = { ...pendingSuperProperties, viewport: readViewport() };
      mixpanel.register(pendingSuperProperties);

      queuedEvents.splice(0).forEach(({ name, props }) => mixpanelInstance?.track(name, props));
    })
    .catch(() => {
      // Fails open: an ad blocker (decision 0025) rejects the import above,
      // so tracking silently stops. The queue is dropped so it cannot grow
      // unbounded for the rest of the session with nothing left to drain it.
      isUnavailable = true;
      queuedEvents.splice(0);
    });
};

// Re-registered whenever a value changes (`register`, never
// `register_once`), so `appSurface` stays correct across a client-side
// navigation between the public site and a panel.
export const registerSuperProperties = (props: Partial<SuperProperties>): void => {
  if (typeof window === 'undefined' || !import.meta.env.PROD || isUnavailable) return;
  pendingSuperProperties = { ...pendingSuperProperties, ...props };
  mixpanelInstance?.register(props);
};

// `props` stays optional even though most typed events require one: a
// handful of existing rabbi/admin panel call sites this change does not
// touch call `trackEvent` with no second argument at all
// (`trackEvent(MIXPANEL_EVENTS.rabbiLogout)`), and this signature has to
// keep accepting that unchanged. The rest-tuple keeps `name` a normal
// parameter so `K` infers before the conditional resolves, and rejects a
// missing or wrong-shape payload for any event whose props are required.
export const trackEvent = <K extends AnalyticsEventName>(
  name: K,
  ...rest: undefined extends AnalyticsEventProps[K] ? [props?: AnalyticsEventProps[K]] : [props: AnalyticsEventProps[K]]
): void => {
  try {
    if (typeof window === 'undefined' || !import.meta.env.PROD || isUnavailable) return;

    const props = rest[0];

    if (mixpanelInstance) {
      mixpanelInstance.track(name, props);
      return;
    }

    // Capped so a page loaded before the dynamic import resolves cannot grow
    // this array for an entire session with nothing ever draining it.
    if (queuedEvents.length >= MIXPANEL_QUEUE_CAP) return;
    queuedEvents.push({ name, props });
  } catch {
    // Fails open: this runs inside every navigation and retry-click handler
    // (a `Link`'s `onClick` fires before its own navigation, and a Retry
    // button tracks before recovering), so a throw here must never block
    // the action it was attached to.
  }
};
