import type { InstallPlatformPath } from '~/analytics/consts';

import {
  ANDROID_USER_AGENT_PATTERN,
  AUTOMATIC_INSTALL_PATHS,
  IN_APP_BROWSER_USER_AGENT_PATTERN,
  IOS_OTHER_BROWSER_USER_AGENT_PATTERN,
  IOS_USER_AGENT_PATTERN,
  IPADOS_MIN_TOUCH_POINTS,
  MACINTOSH_USER_AGENT_PATTERN,
  MAX_INSTALL_DISMISSALS,
  SAFARI_TOKEN_PATTERN,
} from './consts';
import type { InstallEnvironment, InstallPromptState } from './models';

const isIos = ({ userAgent, maxTouchPoints }: InstallEnvironment): boolean =>
  IOS_USER_AGENT_PATTERN.test(userAgent) ||
  (MACINTOSH_USER_AGENT_PATTERN.test(userAgent) && maxTouchPoints >= IPADOS_MIN_TOUCH_POINTS);

// What the browser can do decides first, who it claims to be second: a
// deferred prompt means the native flow works whatever the user agent says,
// and its absence on desktop means there is nothing to offer, so `null`.
// iOS never has a deferred prompt, so there the user agent is the only
// signal. An iOS user agent with no Safari token and no known browser token
// is an app's own web view, which cannot add to the home screen.
export const installPathFor = (environment: InstallEnvironment): InstallPlatformPath | null => {
  const { userAgent, hasDeferredPrompt, isStandalone } = environment;

  if (isStandalone) return null;
  if (hasDeferredPrompt) return 'chromiumPrompt';
  if (IN_APP_BROWSER_USER_AGENT_PATTERN.test(userAgent)) return 'inAppBrowser';

  if (isIos(environment)) {
    if (IOS_OTHER_BROWSER_USER_AGENT_PATTERN.test(userAgent)) return 'iosOtherBrowser';
    return SAFARI_TOKEN_PATTERN.test(userAgent) ? 'iosSafari' : 'inAppBrowser';
  }

  if (ANDROID_USER_AGENT_PATTERN.test(userAgent)) return 'androidGeneric';
  return null;
};

// Fails closed: a `null` state means storage could not be read, and an
// unreadable history cannot be shown to be within the limits.
export const canShowAutomatically = (path: InstallPlatformPath | null, state: InstallPromptState | null): boolean => {
  if (path === null || state === null) return false;
  if (!AUTOMATIC_INSTALL_PATHS.has(path)) return false;
  if (state.isInstalled || state.wasShownThisSession) return false;
  return state.dismissalCount < MAX_INSTALL_DISMISSALS;
};

// A show is never counted. Only a dismissal is, so a card the visitor
// ignored costs nothing and may return in a later session.
export const afterShow = (state: InstallPromptState): InstallPromptState => ({ ...state, wasShownThisSession: true });

export const afterDismissal = (state: InstallPromptState): InstallPromptState => ({
  ...state,
  dismissalCount: state.dismissalCount + 1,
});

export const afterInstall = (state: InstallPromptState): InstallPromptState => ({ ...state, isInstalled: true });
