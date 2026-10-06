import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test';

import { ContactBar } from '~/CoursePage/components/ContactBar/ContactBar';
import { atFrameSize } from '~/storyMocks';

import { InstallPrompt } from './InstallPrompt';
import type { InstallDevice, InstallFlow } from './models';

const PHONE_ARIA = 'הוספת האתר למסך הבית';
const COMPUTER_ARIA = 'הוספת האתר למחשב';

const device = (overrides: Partial<InstallDevice>): InstallDevice => ({
  path: 'chromiumPrompt',
  isComputer: false,
  shareButtonPlacement: 'bottom',
  ...overrides,
});

const open = (trigger: 'auto' | 'footer', step: 'offer' | 'instructions', installDevice: InstallDevice): InstallFlow => ({
  status: 'open',
  trigger,
  step,
  device: installDevice,
});

const meta: Meta<typeof InstallPrompt> = {
  title: 'Layout/InstallPrompt',
  component: InstallPrompt,
  parameters: { layout: 'fullscreen' },
  args: {
    flow: open('auto', 'offer', device({})),
    onAccept: fn(),
    onDismiss: fn(),
    onCopyLink: fn(() => Promise.resolve()),
  },
};

export default meta;
type Story = StoryObj<typeof InstallPrompt>;

const body = () => within(document.body);

// The automatic card on a phone with the native prompt: a region, not a
// dialog, so nothing dims and the page behind stays usable.
export const ChromiumOfferOnPhone: Story = {
  play: async ({ args }) => {
    const card = await body().findByRole('region', { name: PHONE_ARIA });

    await expect(body().queryByRole('dialog')).not.toBeInTheDocument();
    await expect(within(card).getByText('שלא תפספסו את השיעור הבא')).toBeInTheDocument();
    await expect(within(card).getByText('תורה ברבים במסך הבית, וכל השיעורים בלחיצה.')).toBeInTheDocument();
    await expect(card).not.toHaveFocus();

    await userEvent.click(within(card).getByRole('button', { name: 'הוספה למסך הבית' }));
    await expect(args.onAccept).toHaveBeenCalledTimes(1);

    await userEvent.click(within(card).getByRole('button', { name: 'לא עכשיו' }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};

export const ChromiumOfferOnComputer: Story = {
  args: { flow: open('auto', 'offer', device({ isComputer: true })) },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async () => {
    const card = await body().findByRole('region', { name: COMPUTER_ARIA });

    await expect(within(card).getByText('תורה ברבים במחשב, וכל השיעורים בלחיצה.')).toBeInTheDocument();
    await expect(within(card).getByRole('button', { name: 'הוספה למחשב' })).toBeInTheDocument();

    // From md up the card is a 400px corner card at the inline-end side, which
    // in right-to-left is the left edge of the screen.
    await atFrameSize(1440, 900, async () => {
      const box = card.getBoundingClientRect();
      await expect(Math.round(box.width)).toBe(400);
      await expect(Math.round(box.left)).toBe(24);
      await expect(Math.round(window.innerHeight - box.bottom)).toBe(24);
    });
  },
};

export const IosOfferInitial: Story = {
  args: { flow: open('auto', 'offer', device({ path: 'iosSafari' })) },
  play: async () => {
    const card = await body().findByRole('region', { name: PHONE_ARIA });
    await expect(within(card).getByRole('button', { name: 'הוספה למסך הבית' })).toBeInTheDocument();
  },
};

// The narrowest supported phone: the offer must wrap, not overflow.
export const IosOfferOnNarrowestPhone: Story = {
  args: { flow: open('auto', 'offer', device({ path: 'iosSafari' })) },
  play: async () => {
    const card = await body().findByRole('region', { name: PHONE_ARIA });

    await atFrameSize(320, 693, async () => {
      await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
      await expect(within(card).getByRole('button', { name: 'הוספה למסך הבית' })).toBeVisible();
    });
  },
};

// After the offer is accepted on iOS the same card grows into the steps,
// still without a scrim, so Safari's share button stays visible and tappable.
export const IosInstructionsFromTheCardWithShareAtTheBottom: Story = {
  args: { flow: open('auto', 'instructions', device({ path: 'iosSafari' })) },
  play: async ({ args }) => {
    const card = await body().findByRole('region', { name: PHONE_ARIA });

    await expect(within(card).getByText('כך מוסיפים למסך הבית')).toBeInTheDocument();
    await expect(within(card).getByText('לוחצים על כפתור השיתוף בתחתית המסך.')).toBeInTheDocument();
    await expect(within(card).getByText('אם הכפתור לא מופיע, לוחצים קודם על שלוש הנקודות.')).toBeInTheDocument();
    await expect(within(card).getByText('גוללים ובוחרים "הוסף למסך הבית".')).toBeInTheDocument();
    await expect(within(card).getByText('לוחצים על "הוסף" בפינה העליונה.')).toBeInTheDocument();
    await expect(within(card).getByText('וכך זה ייראה במסך הבית')).toBeInTheDocument();
    await expect(body().queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(within(card).getByRole('button', { name: 'הבנתי' }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};

// iPad and every iOS browser other than Safari keep the share button in the
// top bar, so the step must not say "bottom".
export const IosInstructionsWithShareAtTheTop: Story = {
  args: { flow: open('auto', 'instructions', device({ path: 'iosOtherBrowser', shareButtonPlacement: 'top' })) },
  play: async () => {
    const card = await body().findByRole('region', { name: PHONE_ARIA });

    await expect(within(card).getByText(/בראש המסך\./)).toBeInTheDocument();
    await expect(card).not.toHaveTextContent('בתחתית');
    await expect(card).not.toHaveTextContent('שלוש הנקודות');
  },
};

// 320 wide: the steps are taller than the screen, so the card scrolls inside
// itself rather than pushing the close button off screen.
export const IosInstructionsOnNarrowestPhone: Story = {
  args: { flow: open('auto', 'instructions', device({ path: 'iosSafari' })) },
  play: async () => {
    const card = await body().findByRole('region', { name: PHONE_ARIA });

    await atFrameSize(320, 520, async () => {
      await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
      await expect(card.getBoundingClientRect().height).toBeLessThanOrEqual(window.innerHeight * 0.9 + 1);
      await expect(card.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
    });
  },
};

// Opened from the footer link: the ordinary modal sheet.
export const IosInstructionsFromTheFooter: Story = {
  args: { flow: open('footer', 'instructions', device({ path: 'iosSafari' })) },
  play: async ({ args }) => {
    const dialog = await body().findByRole('dialog', { name: PHONE_ARIA });

    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(within(dialog).getByText('כך מוסיפים למסך הבית')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};

export const InAppBrowserExplanation: Story = {
  args: { flow: open('footer', 'instructions', device({ path: 'inAppBrowser' })) },
  play: async ({ args }) => {
    const dialog = await body().findByRole('dialog', { name: PHONE_ARIA });

    await expect(within(dialog).getByText('קודם פותחים את האתר בדפדפן')).toBeInTheDocument();
    await expect(within(dialog).getByText('Safari')).toBeInTheDocument();
    await expect(within(dialog).getByText('Chrome')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'העתקת הקישור' }));
    await expect(args.onCopyLink).toHaveBeenCalledTimes(1);
    await expect(await within(dialog).findByRole('button', { name: 'הקישור הועתק' })).toBeInTheDocument();
  },
};

// A browser that refuses the clipboard leaves the button as it was and logs
// the failure; it never claims the link was copied.
export const InAppBrowserCopyFails: Story = {
  args: {
    flow: open('footer', 'instructions', device({ path: 'inAppBrowser' })),
    onCopyLink: fn(() => Promise.reject(new Error('clipboard blocked'))),
  },
  play: async () => {
    const errorLog = spyOn(console, 'error').mockImplementation(() => {});
    try {
      const dialog = await body().findByRole('dialog', { name: PHONE_ARIA });
      await userEvent.click(within(dialog).getByRole('button', { name: 'העתקת הקישור' }));

      await waitFor(() => expect(errorLog).toHaveBeenCalled());
      await expect(within(dialog).getByRole('button', { name: 'העתקת הקישור' })).toBeInTheDocument();
    } finally {
      errorLog.mockRestore();
    }
  },
};

export const BrowserMenuInstructions: Story = {
  args: { flow: open('footer', 'instructions', device({ path: 'androidGeneric' })) },
  play: async ({ args }) => {
    const dialog = await body().findByRole('dialog', { name: PHONE_ARIA });

    await expect(within(dialog).getByText('הוספה דרך תפריט הדפדפן')).toBeInTheDocument();
    await expect(within(dialog).getByText('פותחים את תפריט הדפדפן בפינה העליונה.')).toBeInTheDocument();
    await expect(within(dialog).getByText('בוחרים "הוספה למסך הבית".')).toBeInTheDocument();
    await expect(within(dialog).getByText('בחלק מהמכשירים האפשרות נקראת "התקנת האפליקציה".')).toBeInTheDocument();
    await expect(within(dialog).getByText('אם האפשרות לא מופיעה, ייתכן שהאתר כבר נמצא במסך הבית.')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'הבנתי' }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};

const BAR_PHONE = '0501234567';

// A course page below lg has a fixed contact bar along the bottom edge; the
// card sits directly above it and never covers it.
export const CoursePageCardSitsAboveTheContactBar: Story = {
  render: (args) => (
    <>
      <ContactBar courseId="story-course" courseName="יסודות האמונה" contactPhone={BAR_PHONE} />
      <InstallPrompt {...args} />
    </>
  ),
  play: async () => {
    const card = await body().findByRole('region', { name: PHONE_ARIA });
    const bar = document.querySelector('[data-fixed-bottom-bar] > .phoneActions');
    if (!bar) throw new Error('InstallPrompt story: the fixed contact bar was not rendered');

    await atFrameSize(390, 844, async () => {
      // The card slides in over 160ms, so its edge is measured once it settles.
      await waitFor(() => expect(Math.round(card.getBoundingClientRect().bottom)).toBe(Math.round(bar.getBoundingClientRect().top)));
      await expect(within(card).getByRole('button', { name: 'הוספה למסך הבית' })).toBeVisible();
    });
  },
};

// From lg the bar is not drawn and the card returns to its own corner.
export const CoursePageCardAtDesktopWidth: Story = {
  args: { flow: open('auto', 'offer', device({ isComputer: true })) },
  render: (args) => (
    <>
      <ContactBar courseId="story-course" courseName="יסודות האמונה" contactPhone={BAR_PHONE} />
      <InstallPrompt {...args} />
    </>
  ),
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async () => {
    const card = await body().findByRole('region', { name: COMPUTER_ARIA });

    await atFrameSize(1440, 900, async () => {
      await expect(Math.round(window.innerHeight - card.getBoundingClientRect().bottom)).toBe(24);
    });
  },
};
