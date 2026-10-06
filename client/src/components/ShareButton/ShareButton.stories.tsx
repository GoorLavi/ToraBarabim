import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { primaryFieldDecorator } from '~/storyDecorators';

import * as consts from './consts';
import { ShareButton } from './ShareButton';

const TEXT = 'שיעור בגמרא עם הרב אייל עמרמי\nכל יום שלישי בשעה 20:30\nבית הכנסת הגדול, פתח תקווה';
const URL = 'https://torahbarabim.com/lesson/lesson-1/2026-10-13?s';

const meta: Meta<typeof ShareButton> = {
  title: 'components/ShareButton',
  component: ShareButton,
  args: { text: TEXT, url: URL, tone: 'light', surface: 'lessonPage' },
};

export default meta;
type Story = StoryObj<typeof ShareButton>;

type NavigatorShim = { share?: unknown; clipboard?: unknown };

// The share sheet and the clipboard are properties of the real `navigator`:
// replaced for one play and put back exactly as they were (own property or
// inherited, present or absent), so no story leaks a stub into the next.
const stubNavigator = (stubs: NavigatorShim): (() => void) => {
  const originals = Object.keys(stubs).map((key) => [key, Object.getOwnPropertyDescriptor(navigator, key)] as const);
  for (const [key, value] of Object.entries(stubs)) {
    Object.defineProperty(navigator, key, { value, configurable: true, writable: true });
  }
  return () => {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(navigator, key, descriptor);
      else delete (navigator as unknown as NavigatorShim)[key as keyof NavigatorShim];
    }
  };
};

const resolvingClipboard = () => {
  const calls: string[] = [];
  return { calls, clipboard: { writeText: (value: string) => { calls.push(value); return Promise.resolve(); } } };
};

export const Light: Story = {};

export const Plum: Story = {
  args: { tone: 'plum', surface: 'rabbiPage' },
  decorators: [primaryFieldDecorator],
};

// No share sheet (a desktop browser): the click copies the link, the label
// swaps with a check, and goes back after the reset delay.
export const Copied: Story = {
  play: async ({ canvasElement }) => {
    const { calls, clipboard } = resolvingClipboard();
    const restore = stubNavigator({ share: undefined, clipboard });
    try {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole('button', { name: consts.SHARE_LABEL }));
      await expect(await canvas.findByRole('button', { name: consts.COPIED_LABEL })).toBeVisible();
      await expect(calls).toEqual([URL]);
      await expect(canvas.getByRole('status')).toHaveTextContent(consts.COPIED_LABEL);
    } finally {
      restore();
    }
  },
};

export const CopiedResetsToShare: Story = {
  play: async ({ canvasElement }) => {
    const { clipboard } = resolvingClipboard();
    const restore = stubNavigator({ share: undefined, clipboard });
    try {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole('button', { name: consts.SHARE_LABEL }));
      await canvas.findByRole('button', { name: consts.COPIED_LABEL });
      await waitFor(() => expect(canvas.getByRole('button', { name: consts.SHARE_LABEL })).toBeVisible(), { timeout: consts.COPIED_RESET_MS + 2000 });
    } finally {
      restore();
    }
  },
};

// A clipboard that rejects (a blocked permission, an insecure page): the
// person gets the link itself, in a field they can select, left to right.
export const CopyFailed: Story = {
  play: async ({ canvasElement }) => {
    const restore = stubNavigator({ share: undefined, clipboard: { writeText: () => Promise.reject(new DOMException('blocked', 'NotAllowedError')) } });
    try {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole('button', { name: consts.SHARE_LABEL }));
      await expect(await canvas.findByText(consts.COPY_FAILED_LINE)).toBeVisible();
      const field = canvas.getByText(URL);
      await expect(field).toBeVisible();
      await expect(field).toHaveAttribute('dir', 'ltr');
      await expect(canvas.getByRole('button', { name: consts.SHARE_LABEL })).toBeVisible();
    } finally {
      restore();
    }
  },
};

export const CopyFailedPlum: Story = {
  ...CopyFailed,
  args: { tone: 'plum', surface: 'placePage' },
  decorators: [primaryFieldDecorator],
};

export const NativeShare: Story = {
  play: async ({ canvasElement }) => {
    const shared: unknown[] = [];
    const { calls, clipboard } = resolvingClipboard();
    const restore = stubNavigator({ share: (data: unknown) => { shared.push(data); return Promise.resolve(); }, clipboard });
    try {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole('button', { name: consts.SHARE_LABEL }));
      await waitFor(() => expect(shared).toEqual([{ text: `${TEXT}\n${URL}` }]));
      await expect(calls).toEqual([]);
      await expect(canvas.getByRole('button', { name: consts.SHARE_LABEL })).toBeVisible();
    } finally {
      restore();
    }
  },
};

// The person closed the share sheet: nothing is copied and nothing is said.
export const NativeShareDismissed: Story = {
  play: async ({ canvasElement }) => {
    let shareCalls = 0;
    const { calls, clipboard } = resolvingClipboard();
    const restore = stubNavigator({
      share: () => {
        shareCalls += 1;
        return Promise.reject(new DOMException('dismissed', 'AbortError'));
      },
      clipboard,
    });
    try {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole('button', { name: consts.SHARE_LABEL }));
      await waitFor(() => expect(shareCalls).toBe(1));
      await expect(calls).toEqual([]);
      await expect(canvas.getByRole('status')).toBeEmptyDOMElement();
    } finally {
      restore();
    }
  },
};

// Any other share failure falls through to copying the link.
export const NativeShareFailsAndCopies: Story = {
  play: async ({ canvasElement }) => {
    const { calls, clipboard } = resolvingClipboard();
    const restore = stubNavigator({ share: () => Promise.reject(new DOMException('no handler', 'NotAllowedError')), clipboard });
    try {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole('button', { name: consts.SHARE_LABEL }));
      await expect(await canvas.findByRole('button', { name: consts.COPIED_LABEL })).toBeVisible();
      await expect(calls).toEqual([URL]);
    } finally {
      restore();
    }
  },
};

// A long link in the failure field must wrap inside a 320 screen.
export const CopyFailedNarrow: Story = {
  ...CopyFailed,
  args: { url: 'https://torahbarabim.com/lesson/0b7d2c1e-4f5a-4c9e-9a3b-1d2e3f4a5b6c/2026-10-13?s' },
  decorators: [(Story) => <div style={{ maxInlineSize: '288px' }}><Story /></div>],
  play: async ({ canvasElement }) => {
    const restore = stubNavigator({ share: undefined, clipboard: { writeText: () => Promise.reject(new DOMException('blocked', 'NotAllowedError')) } });
    try {
      await userEvent.click(within(canvasElement).getByRole('button', { name: consts.SHARE_LABEL }));
      await within(canvasElement).findByText(consts.COPY_FAILED_LINE);
    } finally {
      restore();
    }
  },
};
