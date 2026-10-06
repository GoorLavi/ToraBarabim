import { describe, expect, it } from 'vitest';

import { AUTO_SHOW_AFTER_VISIBLE_SECONDS, AUTO_SHOW_TICK_MS, MAX_COUNTED_TICK_MS, MS_PER_SECOND } from './consts';
import {
  acceptanceEventPropsOnInstructionsOpened,
  afterDismissal,
  afterInstall,
  afterShow,
  canShowAutomatically,
  countsTowardDismissalLimit,
  dismissalEventPropsOnClose,
  installPathFor,
  isComputerDevice,
  shareButtonPlacementFor,
  visibleMsAfterTick,
} from './helpers';
import type { InstallDevice, InstallEnvironment, InstallPromptState, OpenInstallFlow } from './models';

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const IPHONE_CHROME =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.0.0 Mobile/15E148 Safari/604.1';
const IPHONE_FIREFOX =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/130.0 Mobile/15E148 Safari/605.1.15';
const IPHONE_INSTAGRAM =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.0 (iPhone15,2)';
const IPHONE_BARE_WEB_VIEW =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
const IPADOS_SAFARI =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const ANDROID_CHROME =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const ANDROID_FIREFOX = 'Mozilla/5.0 (Android 14; Mobile; rv:130.0) Gecko/130.0 Firefox/130.0';
const ANDROID_WEB_VIEW =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.0.0 Mobile Safari/537.36';
const ANDROID_FACEBOOK =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/450.0.0.0;]';
const DESKTOP_CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const DESKTOP_FIREFOX = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0';
const MAC_SAFARI = IPADOS_SAFARI;

const environment = (overrides: Partial<InstallEnvironment>): InstallEnvironment => ({
  userAgent: DESKTOP_CHROME,
  maxTouchPoints: 0,
  hasDeferredPrompt: false,
  isStandalone: false,
  ...overrides,
});

describe('installPathFor', () => {
  it('offers the native prompt on Android Chrome when the browser deferred one', () => {
    expect(installPathFor(environment({ userAgent: ANDROID_CHROME, maxTouchPoints: 5, hasDeferredPrompt: true }))).toBe('chromiumPrompt');
  });

  it('offers the native prompt on desktop Chrome or Edge when the browser deferred one', () => {
    expect(installPathFor(environment({ hasDeferredPrompt: true }))).toBe('chromiumPrompt');
  });

  it('lets the capability outrank the user agent', () => {
    expect(installPathFor(environment({ userAgent: DESKTOP_FIREFOX, hasDeferredPrompt: true }))).toBe('chromiumPrompt');
  });

  it('gives iPhone Safari the Safari instructions', () => {
    expect(installPathFor(environment({ userAgent: IPHONE_SAFARI, maxTouchPoints: 5 }))).toBe('iosSafari');
  });

  it('gives iPhone Chrome and Firefox the other-browser instructions', () => {
    expect(installPathFor(environment({ userAgent: IPHONE_CHROME, maxTouchPoints: 5 }))).toBe('iosOtherBrowser');
    expect(installPathFor(environment({ userAgent: IPHONE_FIREFOX, maxTouchPoints: 5 }))).toBe('iosOtherBrowser');
  });

  it('recognises iPadOS Safari, which reports a Macintosh user agent, by its touch points', () => {
    expect(installPathFor(environment({ userAgent: IPADOS_SAFARI, maxTouchPoints: 5 }))).toBe('iosSafari');
  });

  it('gives a real Mac with no touch screen nothing', () => {
    expect(installPathFor(environment({ userAgent: MAC_SAFARI, maxTouchPoints: 0 }))).toBeNull();
  });

  it('sends iOS in-app browsers and bare web views to the open-in-a-browser path', () => {
    expect(installPathFor(environment({ userAgent: IPHONE_INSTAGRAM, maxTouchPoints: 5 }))).toBe('inAppBrowser');
    expect(installPathFor(environment({ userAgent: IPHONE_BARE_WEB_VIEW, maxTouchPoints: 5 }))).toBe('inAppBrowser');
  });

  it('sends Android in-app browsers and WebView to the open-in-a-browser path', () => {
    expect(installPathFor(environment({ userAgent: ANDROID_FACEBOOK, maxTouchPoints: 5 }))).toBe('inAppBrowser');
    expect(installPathFor(environment({ userAgent: ANDROID_WEB_VIEW, maxTouchPoints: 5 }))).toBe('inAppBrowser');
  });

  it('gives Android without a deferred prompt the generic instructions', () => {
    expect(installPathFor(environment({ userAgent: ANDROID_CHROME, maxTouchPoints: 5 }))).toBe('androidGeneric');
    expect(installPathFor(environment({ userAgent: ANDROID_FIREFOX, maxTouchPoints: 5 }))).toBe('androidGeneric');
  });

  it('returns null on desktop without a deferred prompt', () => {
    expect(installPathFor(environment({ userAgent: DESKTOP_CHROME }))).toBeNull();
    expect(installPathFor(environment({ userAgent: DESKTOP_FIREFOX }))).toBeNull();
  });

  it('returns null when already running standalone, whatever else is true', () => {
    expect(installPathFor(environment({ userAgent: IPHONE_SAFARI, maxTouchPoints: 5, isStandalone: true }))).toBeNull();
    expect(installPathFor(environment({ hasDeferredPrompt: true, isStandalone: true }))).toBeNull();
  });
});

const freshState: InstallPromptState = { dismissalCount: 0, isInstalled: false, wasShownThisSession: false };

describe('canShowAutomatically', () => {
  it('shows a fresh visitor on an automatic path', () => {
    expect(canShowAutomatically('chromiumPrompt', freshState)).toBe(true);
    expect(canShowAutomatically('iosSafari', freshState)).toBe(true);
    expect(canShowAutomatically('iosOtherBrowser', freshState)).toBe(true);
  });

  it('never shows on the footer-only paths or with no path', () => {
    expect(canShowAutomatically('androidGeneric', freshState)).toBe(false);
    expect(canShowAutomatically('inAppBrowser', freshState)).toBe(false);
    expect(canShowAutomatically(null, freshState)).toBe(false);
  });

  it('shows at most once per session', () => {
    expect(canShowAutomatically('chromiumPrompt', afterShow(freshState))).toBe(false);
  });

  it('does not count a show: an ignored card may return in a later session', () => {
    const nextSession = { ...afterShow(freshState), wasShownThisSession: false };

    expect(nextSession.dismissalCount).toBe(0);
    expect(canShowAutomatically('chromiumPrompt', nextSession)).toBe(true);
  });

  it('allows one more show after a single dismissal and none after the second', () => {
    const afterOne = { ...afterDismissal(afterShow(freshState)), wasShownThisSession: false };
    const afterTwo = { ...afterDismissal(afterShow(afterOne)), wasShownThisSession: false };

    expect(canShowAutomatically('iosSafari', afterOne)).toBe(true);
    expect(canShowAutomatically('iosSafari', afterTwo)).toBe(false);
  });

  it('ends for good once the app is installed', () => {
    expect(canShowAutomatically('chromiumPrompt', afterInstall(freshState))).toBe(false);
  });

  it('fails closed when the stored state could not be read', () => {
    expect(canShowAutomatically('chromiumPrompt', null)).toBe(false);
  });
});

describe('isComputerDevice', () => {
  it('is true for a desktop browser and false for a phone or a tablet', () => {
    expect(isComputerDevice({ userAgent: DESKTOP_CHROME, maxTouchPoints: 0 })).toBe(true);
    expect(isComputerDevice({ userAgent: ANDROID_CHROME, maxTouchPoints: 5 })).toBe(false);
    expect(isComputerDevice({ userAgent: IPHONE_SAFARI, maxTouchPoints: 5 })).toBe(false);
    expect(isComputerDevice({ userAgent: IPADOS_SAFARI, maxTouchPoints: 5 })).toBe(false);
  });
});

describe('shareButtonPlacementFor', () => {
  it('puts the share button at the bottom only on iPhone Safari', () => {
    expect(shareButtonPlacementFor({ userAgent: IPHONE_SAFARI, maxTouchPoints: 5 })).toBe('bottom');
  });

  it('puts it at the top on iPad and in every other iOS browser', () => {
    expect(shareButtonPlacementFor({ userAgent: IPADOS_SAFARI, maxTouchPoints: 5 })).toBe('top');
    expect(shareButtonPlacementFor({ userAgent: IPHONE_CHROME, maxTouchPoints: 5 })).toBe('top');
    expect(shareButtonPlacementFor({ userAgent: IPHONE_FIREFOX, maxTouchPoints: 5 })).toBe('top');
  });
});

const flowOf = (trigger: OpenInstallFlow['trigger'], step: OpenInstallFlow['step'], path: InstallDevice['path']): OpenInstallFlow => ({
  status: 'open',
  trigger,
  step,
  device: { path, isComputer: false, shareButtonPlacement: 'bottom' },
});

describe('install events', () => {
  it('reports a dismissal when the automatic offer is closed', () => {
    expect(dismissalEventPropsOnClose(flowOf('auto', 'offer', 'iosSafari'))).toEqual({
      platformPath: 'iosSafari',
      trigger: 'auto',
      step: 'card',
    });
  });

  it('reports nothing when an automatic card is closed on its instructions', () => {
    expect(dismissalEventPropsOnClose(flowOf('auto', 'instructions', 'iosSafari'))).toBeNull();
  });

  it('reports nothing when a footer flow is closed on its instructions, for every instructions path', () => {
    expect(dismissalEventPropsOnClose(flowOf('footer', 'instructions', 'iosSafari'))).toBeNull();
    expect(dismissalEventPropsOnClose(flowOf('footer', 'instructions', 'androidGeneric'))).toBeNull();
    expect(dismissalEventPropsOnClose(flowOf('footer', 'instructions', 'inAppBrowser'))).toBeNull();
  });

  it('reports an acceptance when the instructions open, from the card and from the footer', () => {
    expect(acceptanceEventPropsOnInstructionsOpened(flowOf('auto', 'offer', 'iosOtherBrowser'))).toEqual({
      platformPath: 'iosOtherBrowser',
      trigger: 'auto',
    });
    expect(acceptanceEventPropsOnInstructionsOpened(flowOf('footer', 'instructions', 'inAppBrowser'))).toEqual({
      platformPath: 'inAppBrowser',
      trigger: 'footer',
    });
  });

  it('spends a dismissal only for the automatic card', () => {
    expect(countsTowardDismissalLimit(flowOf('auto', 'instructions', 'iosSafari'))).toBe(true);
    expect(countsTowardDismissalLimit(flowOf('auto', 'offer', 'chromiumPrompt'))).toBe(true);
    expect(countsTowardDismissalLimit(flowOf('footer', 'instructions', 'iosSafari'))).toBe(false);
  });
});

describe('visibleMsAfterTick', () => {
  const MINUTE_MS = 60_000;
  const TEN_MINUTES_MS = 10 * MINUTE_MS;

  it('adds an ordinary tick in full while the page is visible', () => {
    expect(visibleMsAfterTick(5000, 1000, true)).toBe(6000);
  });

  it('adds nothing while the page is hidden', () => {
    expect(visibleMsAfterTick(5000, 1000, false)).toBe(5000);
  });

  it('counts a tick that arrives after a ten minute gap as one capped step, not ten minutes', () => {
    expect(visibleMsAfterTick(5000, TEN_MINUTES_MS, true)).toBe(5000 + MAX_COUNTED_TICK_MS);
  });

  it('still reaches the threshold on ordinary ticks, and not before', () => {
    let visibleMs = 0;
    for (let tick = 1; tick < (AUTO_SHOW_AFTER_VISIBLE_SECONDS * MS_PER_SECOND) / AUTO_SHOW_TICK_MS; tick += 1) visibleMs = visibleMsAfterTick(visibleMs, AUTO_SHOW_TICK_MS, true);
    expect(visibleMs).toBeLessThan(AUTO_SHOW_AFTER_VISIBLE_SECONDS * MS_PER_SECOND);

    visibleMs = visibleMsAfterTick(visibleMs, AUTO_SHOW_TICK_MS, true);
    expect(visibleMs).toBe(AUTO_SHOW_AFTER_VISIBLE_SECONDS * MS_PER_SECOND);
  });
});
