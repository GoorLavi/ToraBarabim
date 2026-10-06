import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { atFrameSize } from '~/storyMocks';

import { occurrenceWhenLabel } from '../../../../helpers';

import * as consts from './consts';
import { CalendarSheet } from './CalendarSheet';

const meta: Meta<typeof CalendarSheet> = {
  title: 'LessonPage/CalendarSheet',
  component: CalendarSheet,
  args: {
    dateLabel: 'יום שלישי, 27 באוגוסט, בשעה 20:30',
    step: { step: 'calendar' },
    onChooseCalendar: fn(),
    onAddOneEvent: fn(),
    onSubscribe: fn(),
    onBack: fn(),
    onDismiss: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CalendarSheet>;

// The sheet renders into the page body, outside the story canvas.
const sheet = (): Promise<HTMLElement> => within(document.body).findByRole('dialog', { name: consts.SHEET_TITLE });

const rowNamed = (dialog: HTMLElement, title: string): HTMLElement => within(dialog).getByRole('button', { name: new RegExp(title) });

// Whether a phrase sits on one line: a range over text that wrapped inside
// it reports rectangles at more than one height.
const isOnOneLine = (container: HTMLElement, phrase: string): boolean => {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const start = node.textContent?.indexOf(phrase) ?? -1;
    if (start === -1) continue;
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, start + phrase.length);
    return new Set(Array.from(range.getClientRects()).map((rect) => Math.round(rect.top))).size === 1;
  }
  throw new Error(`story: phrase "${phrase}" not found in the sheet`);
};

export const CalendarQuestion: Story = {
  play: async ({ args }) => {
    const dialog = await sheet();
    await expect(within(dialog).getByRole('heading', { name: consts.SHEET_TITLE })).toBeInTheDocument();
    await expect(within(dialog).getByText(consts.CALENDAR_QUESTION)).toBeInTheDocument();
    await expect(within(dialog).queryByRole('button', { name: consts.BACK_LABEL })).toBeNull();
    await expect(within(dialog).queryByText(consts.ADD_ONE_TITLE)).toBeNull();

    await userEvent.click(rowNamed(dialog, consts.CALENDAR_CHOICE_COPY.google.title));
    await expect(args.onChooseCalendar).toHaveBeenLastCalledWith('google');
    await userEvent.click(rowNamed(dialog, consts.CALENDAR_CHOICE_COPY.device.title));
    await expect(args.onChooseCalendar).toHaveBeenLastCalledWith('device');
    await expect(args.onChooseCalendar).toHaveBeenCalledTimes(2);
  },
};

export const ScopeAfterGoogle: Story = {
  args: { step: { step: 'scope', calendar: 'google', canGoBack: true } },
  play: async ({ args }) => {
    const dialog = await sheet();
    await expect(within(dialog).getByText(consts.CALENDAR_CHOICE_COPY.google.title)).toBeInTheDocument();
    await expect(dialog.querySelector('.chosenCalendar > .mark mask')).not.toBeNull();
    await expect(within(dialog).queryByText(consts.CALENDAR_QUESTION)).toBeNull();

    await userEvent.click(rowNamed(dialog, consts.ADD_ONE_TITLE));
    await expect(args.onAddOneEvent).toHaveBeenCalledTimes(1);
    await userEvent.click(rowNamed(dialog, consts.SUBSCRIBE_TITLE));
    await expect(args.onSubscribe).toHaveBeenCalledTimes(1);
    await userEvent.click(within(dialog).getByRole('button', { name: consts.BACK_LABEL }));
    await expect(args.onBack).toHaveBeenCalledTimes(1);
  },
};

// The device calendar has no brand mark: the plum calendar glyph stands in the
// same slot.
export const ScopeAfterDevice: Story = {
  args: { step: { step: 'scope', calendar: 'device', canGoBack: true } },
  play: async () => {
    const dialog = await sheet();
    await expect(within(dialog).getByText(consts.CALENDAR_CHOICE_COPY.device.title)).toBeInTheDocument();
    await expect(dialog.querySelector('.chosenCalendar > .mark path[stroke="currentColor"]')).not.toBeNull();
    await expect(dialog.querySelector('.chosenCalendar > .mark mask')).toBeNull();
    await expect(within(dialog).getByRole('button', { name: consts.BACK_LABEL })).toBeInTheDocument();
  },
};

// Android was never asked which calendar, so there is nothing to go back to
// and nothing to name: the shipped sheet.
export const ScopeOnAndroid: Story = {
  args: { step: { step: 'scope', calendar: 'google', canGoBack: false } },
  play: async () => {
    const dialog = await sheet();
    await expect(within(dialog).queryByRole('button', { name: consts.BACK_LABEL })).toBeNull();
    await expect(dialog.querySelector('.chosenCalendar')).toBeNull();
    await expect(rowNamed(dialog, consts.ADD_ONE_TITLE)).toBeInTheDocument();
    await expect(rowNamed(dialog, consts.SUBSCRIBE_TITLE)).toBeInTheDocument();
  },
};

const NARROW_PHONE = {
  globals: { viewport: { value: 'narrow', isRotated: false } },
  parameters: { viewport: { options: { narrow: { name: 'Narrow 320', styles: { width: '320px', height: '100%' }, type: 'mobile' } } } },
} as const;

const LONGEST_DATE = 'יום רביעי, 30 בספטמבר, בשעה 06:00';
const LONGEST_DATE_PHRASES = ['30 בספטמבר', 'בשעה 06:00'];

// The longest date the site can phrase, on the narrowest phone: it wraps
// between its phrases, never inside one, and never overflows its row.
export const LongDateAt320: Story = {
  args: { dateLabel: LONGEST_DATE, step: { step: 'scope', calendar: 'google', canGoBack: true } },
  ...NARROW_PHONE,
  play: () =>
    atFrameSize(320, undefined, async () => {
      const dialog = await sheet();
      await expect(dialog.scrollWidth).toBeLessThanOrEqual(dialog.clientWidth);
      for (const phrase of LONGEST_DATE_PHRASES) await expect(isOnOneLine(dialog, phrase)).toBe(true);
    }),
};

export const CalendarQuestionAt320: Story = {
  ...NARROW_PHONE,
  play: () =>
    atFrameSize(320, undefined, async () => {
      const dialog = await sheet();
      await expect(dialog.scrollWidth).toBeLessThanOrEqual(dialog.clientWidth);
      for (const calendar of ['google', 'device'] as const) {
        await expect(isOnOneLine(dialog, consts.CALENDAR_CHOICE_COPY[calendar].title)).toBe(true);
      }
    }),
};

// From md the sheet is a centred dialog no wider than 480.
const desktopDialogStory = (args: Story['args']): Story => ({
  args,
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: () =>
    atFrameSize(1280, 800, async () => {
      const dialog = await sheet();
      const box = dialog.getBoundingClientRect();
      await expect(box.width).toBeLessThanOrEqual(480);
      await expect(Math.abs(box.left + box.width / 2 - window.innerWidth / 2)).toBeLessThanOrEqual(1);
      await expect(box.bottom).toBeLessThan(window.innerHeight);
    }),
});

export const DesktopCalendarQuestion: Story = desktopDialogStory({});
export const DesktopScopeAfterGoogle: Story = desktopDialogStory({ step: { step: 'scope', calendar: 'google', canGoBack: true } });
