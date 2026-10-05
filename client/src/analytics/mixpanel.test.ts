import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { INTERNAL_BROWSER_STORAGE_KEY, MIXPANEL_EVENTS } from './consts';

const sdk = vi.hoisted(() => ({ init: vi.fn(), register: vi.fn(), track: vi.fn() }));
vi.mock('mixpanel-browser', () => ({ default: sdk }));

const ORDINARY_CHROME =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';

const stubBrowser = (localStorage: Pick<Storage, 'getItem' | 'setItem'>): void => {
  vi.stubGlobal('window', { localStorage, matchMedia: () => ({ matches: false }) });
  vi.stubGlobal('navigator', { userAgent: ORDINARY_CHROME, webdriver: false });
};

const memoryStorage = (entries: Record<string, string> = {}): Pick<Storage, 'getItem' | 'setItem'> => ({
  getItem: (key) => entries[key] ?? null,
  setItem: (key, value) => {
    entries[key] = value;
  },
});

const loadMixpanel = (): Promise<typeof import('./mixpanel')> => import('./mixpanel');

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('PROD', true);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('internal browsers', () => {
  it('loads Mixpanel for an unmarked browser', async () => {
    stubBrowser(memoryStorage());
    const { initAnalytics } = await loadMixpanel();

    initAnalytics();

    await vi.waitFor(() => expect(sdk.init).toHaveBeenCalled());
  });

  it('never loads Mixpanel or sends an event from a browser marked internal', async () => {
    stubBrowser(memoryStorage({ [INTERNAL_BROWSER_STORAGE_KEY]: 'true' }));
    const { initAnalytics, trackEvent } = await loadMixpanel();

    initAnalytics();
    trackEvent(MIXPANEL_EVENTS.rabbiLogout);
    await vi.dynamicImportSettled();

    expect(sdk.init).not.toHaveBeenCalled();
    expect(sdk.track).not.toHaveBeenCalled();
  });

  it('stops sending as soon as an admin session marks the browser, and remembers it', async () => {
    const storage = memoryStorage();
    stubBrowser(storage);
    const { initAnalytics, markBrowserInternal, trackEvent } = await loadMixpanel();
    initAnalytics();
    await vi.waitFor(() => expect(sdk.init).toHaveBeenCalled());

    markBrowserInternal();
    trackEvent(MIXPANEL_EVENTS.rabbiLogout);

    expect(sdk.track).not.toHaveBeenCalled();
    expect(storage.getItem(INTERNAL_BROWSER_STORAGE_KEY)).not.toBeNull();
  });

  it('counts the browser when storage cannot be read', async () => {
    stubBrowser({
      getItem: () => {
        throw new Error('storage blocked');
      },
      setItem: () => undefined,
    });
    const { initAnalytics } = await loadMixpanel();

    initAnalytics();

    await vi.waitFor(() => expect(sdk.init).toHaveBeenCalled());
  });

  it('still stops the session when the mark cannot be stored', async () => {
    stubBrowser({
      getItem: () => null,
      setItem: () => {
        throw new Error('storage blocked');
      },
    });
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { initAnalytics, markBrowserInternal, trackEvent } = await loadMixpanel();
    initAnalytics();
    await vi.waitFor(() => expect(sdk.init).toHaveBeenCalled());

    expect(() => markBrowserInternal()).not.toThrow();
    trackEvent(MIXPANEL_EVENTS.rabbiLogout);

    expect(sdk.track).not.toHaveBeenCalled();
  });
});
