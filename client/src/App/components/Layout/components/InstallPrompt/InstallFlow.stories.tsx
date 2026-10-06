import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { startInstallPromptStore } from '~/pwa/installPromptStore';
import type { BeforeInstallPromptEvent } from '~/pwa/models';

import { Footer } from '../Footer/Footer';
import { INSTALL_PROMPT_SESSION_KEY, INSTALL_PROMPT_STORAGE_KEY } from './consts';
import { InstallPrompt } from './InstallPrompt';
import { useInstallState } from './useInstallState';

const PHONE_ARIA = 'הוספת האתר למסך הבית';
const COMPUTER_ARIA = 'הוספת האתר למחשב';

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const IPHONE_INSTAGRAM =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.0 (iPhone15,2)';
const ANDROID_CHROME =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const DESKTOP_FIREFOX = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0';
const DESKTOP_CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

// One second, not a minute: the rest of the cadence is the real thing.
const STORY_AUTO_SHOW_SECONDS = 1;
const CARD_WAIT_MS = 4000;

type Harness = { hasTextField?: boolean; hasOpenDialog?: boolean };

// The hook, the card and the footer together, the way Layout assembles them.
const InstallFlowHarness = ({ hasTextField = false, hasOpenDialog = false }: Harness): ReactElement => {
  const { prompt, footerLink } = useInstallState({ autoShowAfterSeconds: STORY_AUTO_SHOW_SECONDS });
  const [isDialogOpen, setIsDialogOpen] = useState(hasOpenDialog);

  return (
    <>
      <main>
        {hasTextField && <input type="text" aria-label="שדה חיפוש" autoFocus />}
        <button type="button" onClick={() => setIsDialogOpen(false)}>
          סגירת חלון
        </button>
        {isDialogOpen && <div role="dialog" aria-label="חלון פתוח" />}
      </main>
      <Footer {...{ installLink: footerLink }} />
      <InstallPrompt {...prompt} />
    </>
  );
};

const meta: Meta<typeof InstallFlowHarness> = {
  title: 'Layout/InstallPrompt/Flow',
  component: InstallFlowHarness,
  parameters: { layout: 'fullscreen' },
  // Each story starts as a first visit with no prompt waiting: storage is
  // cleared, and an appinstalled event empties the store's deferred prompt,
  // which outlives a story (it is module state).
  beforeEach: () => {
    window.localStorage.removeItem(INSTALL_PROMPT_STORAGE_KEY);
    window.sessionStorage.removeItem(INSTALL_PROMPT_SESSION_KEY);
    startInstallPromptStore();
    window.dispatchEvent(new Event('appinstalled'));
  },
};

export default meta;
type Story = StoryObj<typeof InstallFlowHarness>;

const stubDevice = (userAgent: string, maxTouchPoints: number) => (): (() => void) => {
  Object.defineProperty(navigator, 'userAgent', { value: userAgent, configurable: true });
  Object.defineProperty(navigator, 'maxTouchPoints', { value: maxTouchPoints, configurable: true });
  return () => {
    Reflect.deleteProperty(navigator, 'userAgent');
    Reflect.deleteProperty(navigator, 'maxTouchPoints');
  };
};

const withBrowser = (userAgent: string, maxTouchPoints: number): Pick<Story, 'beforeEach'> => ({
  beforeEach: stubDevice(userAgent, maxTouchPoints),
});

const dispatchInstallPrompt = (outcome: 'accepted' | 'dismissed') => {
  const prompt = fn(() => Promise.resolve());
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    platforms: ['web'],
    prompt,
    userChoice: Promise.resolve({ outcome, platform: 'web' }),
  }) satisfies BeforeInstallPromptEvent;
  window.dispatchEvent(event);
  return prompt;
};

const body = () => within(document.body);
const storedDismissals = (): number => JSON.parse(window.localStorage.getItem(INSTALL_PROMPT_STORAGE_KEY) ?? '{"dismissalCount":0}').dismissalCount;

export const AutomaticCardOpensOnTheNativePath: Story = {
  ...withBrowser(ANDROID_CHROME, 5),
  play: async () => {
    dispatchInstallPrompt('accepted');

    const card = await body().findByRole('region', { name: PHONE_ARIA }, { timeout: CARD_WAIT_MS });
    await expect(within(card).getByRole('button', { name: 'הוספה למסך הבית' })).toBeInTheDocument();
    await expect(window.sessionStorage.getItem(INSTALL_PROMPT_SESSION_KEY)).toBe('true');
  },
};

// Not counted when ignored: the card was shown, and the only thing recorded
// is that this session has had its one show.
export const AnIgnoredCardIsNotCounted: Story = {
  ...withBrowser(ANDROID_CHROME, 5),
  play: async () => {
    dispatchInstallPrompt('accepted');
    await body().findByRole('region', { name: PHONE_ARIA }, { timeout: CARD_WAIT_MS });

    await expect(storedDismissals()).toBe(0);
  },
};

export const EscapeDismissesAndCountsOnce: Story = {
  ...withBrowser(ANDROID_CHROME, 5),
  play: async () => {
    dispatchInstallPrompt('accepted');
    await body().findByRole('region', { name: PHONE_ARIA }, { timeout: CARD_WAIT_MS });

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(body().queryByRole('region', { name: PHONE_ARIA })).not.toBeInTheDocument());
    await expect(storedDismissals()).toBe(1);
  },
};

export const NotNowDismissesAndCountsOnce: Story = {
  ...withBrowser(ANDROID_CHROME, 5),
  play: async () => {
    dispatchInstallPrompt('accepted');
    const card = await body().findByRole('region', { name: PHONE_ARIA }, { timeout: CARD_WAIT_MS });

    await userEvent.click(within(card).getByRole('button', { name: 'לא עכשיו' }));

    await waitFor(() => expect(body().queryByRole('region', { name: PHONE_ARIA })).not.toBeInTheDocument());
    await expect(storedDismissals()).toBe(1);
  },
};

export const AcceptingOpensTheNativeDialogAndEndsTheOffers: Story = {
  ...withBrowser(ANDROID_CHROME, 5),
  play: async () => {
    const prompt = dispatchInstallPrompt('accepted');
    const card = await body().findByRole('region', { name: PHONE_ARIA }, { timeout: CARD_WAIT_MS });

    await userEvent.click(within(card).getByRole('button', { name: 'הוספה למסך הבית' }));

    await waitFor(() => expect(prompt).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(body().queryByRole('region', { name: PHONE_ARIA })).not.toBeInTheDocument());
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem(INSTALL_PROMPT_STORAGE_KEY) ?? '{}').isInstalled).toBe(true));
    await expect(body().queryByRole('button', { name: 'הוספה למסך הבית' })).not.toBeInTheDocument();
  },
};

export const DismissingTheNativeDialogCountsOnce: Story = {
  ...withBrowser(ANDROID_CHROME, 5),
  play: async () => {
    const prompt = dispatchInstallPrompt('dismissed');
    const card = await body().findByRole('region', { name: PHONE_ARIA }, { timeout: CARD_WAIT_MS });

    await userEvent.click(within(card).getByRole('button', { name: 'הוספה למסך הבית' }));

    await waitFor(() => expect(prompt).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(storedDismissals()).toBe(1));
  },
};

export const CardOnDesktopChromium: Story = {
  ...withBrowser(DESKTOP_CHROME, 0),
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    dispatchInstallPrompt('accepted');

    await body().findByRole('region', { name: COMPUTER_ARIA }, { timeout: CARD_WAIT_MS });
    await expect(await within(canvasElement).findByRole('button', { name: 'הוספה למחשב' })).toBeInTheDocument();
  },
};

export const WaitsWhileATextFieldHasFocus: Story = {
  ...withBrowser(ANDROID_CHROME, 5),
  args: { hasTextField: true },
  play: async () => {
    dispatchInstallPrompt('accepted');
    const field = await body().findByRole('textbox', { name: 'שדה חיפוש' });
    field.focus();

    await new Promise((resolve) => window.setTimeout(resolve, 2500));
    await expect(body().queryByRole('region', { name: PHONE_ARIA })).not.toBeInTheDocument();

    field.blur();
    await body().findByRole('region', { name: PHONE_ARIA }, { timeout: CARD_WAIT_MS });
  },
};

export const WaitsWhileADialogIsOpen: Story = {
  ...withBrowser(ANDROID_CHROME, 5),
  args: { hasOpenDialog: true },
  play: async () => {
    dispatchInstallPrompt('accepted');
    await body().findByRole('dialog', { name: 'חלון פתוח' });

    await new Promise((resolve) => window.setTimeout(resolve, 2500));
    await expect(body().queryByRole('region', { name: PHONE_ARIA })).not.toBeInTheDocument();

    await userEvent.click(body().getByRole('button', { name: 'סגירת חלון' }));
    await body().findByRole('region', { name: PHONE_ARIA }, { timeout: CARD_WAIT_MS });
  },
};

// Fail closed: a browser whose storage throws never sees the automatic card.
// The footer link is the visitor's own request and still works.
export const NeverOpensWhenStorageThrows: Story = {
  beforeEach: () => {
    const restoreDevice = stubDevice(ANDROID_CHROME, 5)();
    // Chromium defines localStorage as an own property of window, so it is
    // restored from its saved descriptor rather than deleted.
    const originalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => {
        throw new DOMException('blocked', 'SecurityError');
      },
    });
    return () => {
      if (originalStorage) Object.defineProperty(window, 'localStorage', originalStorage);
      restoreDevice();
    };
  },
  play: async ({ canvasElement }) => {
    dispatchInstallPrompt('accepted');

    await new Promise((resolve) => window.setTimeout(resolve, 2500));
    await expect(body().queryByRole('region', { name: PHONE_ARIA })).not.toBeInTheDocument();
    await expect(await within(canvasElement).findByRole('button', { name: 'הוספה למסך הבית' })).toBeInTheDocument();
  },
};

export const TwoDismissalsEndTheAutomaticCard: Story = {
  beforeEach: [
    stubDevice(ANDROID_CHROME, 5),
    () => window.localStorage.setItem(INSTALL_PROMPT_STORAGE_KEY, JSON.stringify({ dismissalCount: 2, isInstalled: false })),
  ],
  play: async ({ canvasElement }) => {
    dispatchInstallPrompt('accepted');

    await new Promise((resolve) => window.setTimeout(resolve, 2500));
    await expect(body().queryByRole('region', { name: PHONE_ARIA })).not.toBeInTheDocument();
    await expect(await within(canvasElement).findByRole('button', { name: 'הוספה למסך הבית' })).toBeInTheDocument();
  },
};

export const FooterLinkOpensTheNativeDialogDirectly: Story = {
  ...withBrowser(ANDROID_CHROME, 5),
  play: async ({ canvasElement }) => {
    const prompt = dispatchInstallPrompt('accepted');
    const link = await within(canvasElement).findByRole('button', { name: 'הוספה למסך הבית' });

    await userEvent.click(link);

    await waitFor(() => expect(prompt).toHaveBeenCalledTimes(1));
    await expect(body().queryByRole('region', { name: PHONE_ARIA })).not.toBeInTheDocument();
    await expect(body().queryByRole('dialog')).not.toBeInTheDocument();
  },
};

export const FooterLinkGoesStraightToTheIosSteps: Story = {
  ...withBrowser(IPHONE_SAFARI, 5),
  play: async ({ canvasElement }) => {
    const link = await within(canvasElement).findByRole('button', { name: 'הוספה למסך הבית' });

    await userEvent.click(link);

    const dialog = await body().findByRole('dialog', { name: PHONE_ARIA });
    await expect(within(dialog).getByText('כך מוסיפים למסך הבית')).toBeInTheDocument();
    await expect(within(dialog).queryByText('שלא תפספסו את השיעור הבא')).not.toBeInTheDocument();
  },
};

export const FooterLinkInAnInAppBrowserExplainsAndCopies: Story = {
  ...withBrowser(IPHONE_INSTAGRAM, 5),
  play: async ({ canvasElement }) => {
    const link = await within(canvasElement).findByRole('button', { name: 'הוספה למסך הבית' });
    await userEvent.click(link);

    const dialog = await body().findByRole('dialog', { name: PHONE_ARIA });
    await expect(within(dialog).getByText('קודם פותחים את האתר בדפדפן')).toBeInTheDocument();
    await expect(within(dialog).getByRole('button', { name: 'העתקת הקישור' })).toBeInTheDocument();
  },
};

// Android without a deferred prompt: instructions from the footer, and no
// automatic card at all.
export const AndroidWithoutAPromptHasTheFooterLinkOnly: Story = {
  ...withBrowser(ANDROID_CHROME, 5),
  play: async ({ canvasElement }) => {
    const link = await within(canvasElement).findByRole('button', { name: 'הוספה למסך הבית' });

    await new Promise((resolve) => window.setTimeout(resolve, 2500));
    await expect(body().queryByRole('region', { name: PHONE_ARIA })).not.toBeInTheDocument();

    await userEvent.click(link);
    const dialog = await body().findByRole('dialog', { name: PHONE_ARIA });
    await expect(within(dialog).getByText('הוספה דרך תפריט הדפדפן')).toBeInTheDocument();
  },
};

export const DesktopWithoutAPromptOffersNothing: Story = {
  ...withBrowser(DESKTOP_FIREFOX, 0),
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => window.setTimeout(resolve, 2500));

    await expect(within(canvasElement).queryByRole('button', { name: /הוספה למ/ })).not.toBeInTheDocument();
    await expect(body().queryByRole('region')).not.toBeInTheDocument();
  },
};

export const StandaloneOffersNothing: Story = {
  beforeEach: () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({ ...originalMatchMedia.call(window, query), matches: query.includes('standalone') })) as typeof window.matchMedia;
    const restoreDevice = stubDevice(ANDROID_CHROME, 5)();
    return () => {
      window.matchMedia = originalMatchMedia;
      restoreDevice();
    };
  },
  play: async ({ canvasElement }) => {
    dispatchInstallPrompt('accepted');
    await new Promise((resolve) => window.setTimeout(resolve, 2500));

    await expect(within(canvasElement).queryByRole('button', { name: 'הוספה למסך הבית' })).not.toBeInTheDocument();
    await expect(body().queryByRole('region')).not.toBeInTheDocument();
  },
};
