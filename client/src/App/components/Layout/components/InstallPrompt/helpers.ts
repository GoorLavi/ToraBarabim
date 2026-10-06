import type { InstallPlatformPath } from '~/analytics/consts';
import type { InstallAcceptedProps, InstallCardDismissedProps } from '~/analytics/models';

import {
  ANDROID_USER_AGENT_PATTERN,
  AUTOMATIC_INSTALL_PATHS,
  IN_APP_BROWSER_USER_AGENT_PATTERN,
  IOS_OTHER_BROWSER_USER_AGENT_PATTERN,
  IOS_USER_AGENT_PATTERN,
  IPAD_USER_AGENT_PATTERN,
  IPADOS_MIN_TOUCH_POINTS,
  MACINTOSH_USER_AGENT_PATTERN,
  MAX_COUNTED_TICK_MS,
  MAX_INSTALL_DISMISSALS,
  SAFARI_TOKEN_PATTERN,
} from './consts';
import type { InstallEnvironment, InstallPromptState, OpenInstallFlow, ShareButtonPlacement } from './models';

type DeviceSignals = Pick<InstallEnvironment, 'userAgent' | 'maxTouchPoints'>;

const isIpadOs = ({ userAgent, maxTouchPoints }: DeviceSignals): boolean =>
  MACINTOSH_USER_AGENT_PATTERN.test(userAgent) && maxTouchPoints >= IPADOS_MIN_TOUCH_POINTS;

const isIos = (signals: DeviceSignals): boolean => IOS_USER_AGENT_PATTERN.test(signals.userAgent) || isIpadOs(signals);

// A computer is anything that is neither an iOS device nor an Android one.
// Only a Chromium with a deferred prompt reaches the card there, so this
// decides one thing: whether the words say "computer" or "home screen".
export const isComputerDevice = (signals: DeviceSignals): boolean =>
  !isIos(signals) && !ANDROID_USER_AGENT_PATTERN.test(signals.userAgent);

// iPhone Safari is the only iOS browser that puts the share button at the
// bottom: on iPad it is in the top bar, and every other iOS browser puts it
// there too.
export const shareButtonPlacementFor = (signals: DeviceSignals): ShareButtonPlacement => {
  if (IOS_OTHER_BROWSER_USER_AGENT_PATTERN.test(signals.userAgent)) return 'top';
  if (IPAD_USER_AGENT_PATTERN.test(signals.userAgent) || isIpadOs(signals)) return 'top';
  return 'bottom';
};

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

// Closing the offer is a dismissal. Closing an instructions step is not: by
// then the visitor accepted (an automatic card moved on to it, or the footer
// opened it directly), so what they do with the steps is not ours to report.
export const dismissalEventPropsOnClose = (flow: OpenInstallFlow): InstallCardDismissedProps | null =>
  flow.step === 'offer' ? { platformPath: flow.device.path, trigger: flow.trigger, step: 'card' } : null;

// Opening the instructions is the acceptance, from the card's button or from
// the footer link: the same meaning on both, "the visitor asked to be shown how".
export const acceptanceEventPropsOnInstructionsOpened = (flow: Pick<OpenInstallFlow, 'device' | 'trigger'>): InstallAcceptedProps => ({
  platformPath: flow.device.path,
  trigger: flow.trigger,
});

// Only the automatic card spends one of the two dismissals. A footer flow is
// the visitor's own request and never limits what the site offers by itself.
export const countsTowardDismissalLimit = (flow: Pick<OpenInstallFlow, 'trigger'>): boolean => flow.trigger === 'auto';

// Visible time only ever grows by a bounded step: a hidden tab adds nothing,
// and a tick that arrives long after the last one (the phone was locked, the
// tab was in the background) adds at most one capped step, never the gap.
export const visibleMsAfterTick = (previousMs: number, elapsedMs: number, isVisible: boolean): number =>
  isVisible ? previousMs + Math.min(elapsedMs, MAX_COUNTED_TICK_MS) : previousMs;
