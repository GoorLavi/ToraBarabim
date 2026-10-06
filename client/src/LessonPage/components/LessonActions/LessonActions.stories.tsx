import type { LessonOccurrenceDetail } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, mocked, userEvent, within } from 'storybook/test';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { COPY_FAILED_LINE, SHARE_LABEL } from '~/components/ShareButton/consts';
import { rabbiFixture } from '~/rabbiFixture';
import { atFrameSize } from '~/storyMocks';

import * as sheetConsts from './components/CalendarSheet/consts';
import * as consts from './consts';
import { LessonActions } from './LessonActions';

const upcoming: LessonOccurrenceDetail = {
  timing: 'upcoming',
  lessonId: 'lesson-1',
  date: '2026-10-13',
  startTime: '20:30',
  endTime: '21:30',
  status: 'scheduled',
  title: 'עיונים בפרשת השבוע',
  audience: 'mixed',
  rabbi: rabbiFixture({ id: 'rabbi-1', name: 'יעקב מזרחי' }),
  venue: { kind: 'address', name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'נתניה', citySlug: 'נתניה', area: 'sharon' },
  schedule: { kind: 'once' },
  calendarOccurrence: null,
};

const oneTime: LessonOccurrenceDetail = { ...upcoming, calendarOccurrence: upcoming };

const weekly: LessonOccurrenceDetail = { ...upcoming, schedule: { kind: 'weekly', weekdays: [2], startTime: '20:30' }, calendarOccurrence: upcoming };

const meta: Meta<typeof LessonActions> = {
  title: 'LessonPage/LessonActions',
  component: LessonActions,
};

export default meta;
type Story = StoryObj<typeof LessonActions>;

export const OneTimeUpcoming: Story = {
  args: { occurrence: oneTime },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: SHARE_LABEL })).toBeVisible();
    await expect(canvas.getByRole('button', { name: consts.ADD_TO_CALENDAR_LABEL })).toBeVisible();
  },
};

const ANDROID_CHROME = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';
const GOOGLE_EVENT_URL = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
const GOOGLE_SUBSCRIBE_URL = 'https://calendar.google.com/calendar/render?cid=';

// A Google link opens in a new tab, which a story can catch; a device link
// navigates the page itself, which it cannot, so no story taps one.
const stubWindowOpen = (): (() => void) => {
  const original = window.open;
  window.open = fn() as typeof window.open;
  return () => {
    window.open = original;
  };
};

const stubAndroid = (): (() => void) => {
  Object.defineProperty(navigator, 'userAgent', { value: ANDROID_CHROME, configurable: true });
  const restoreWindowOpen = stubWindowOpen();
  return () => {
    Reflect.deleteProperty(navigator, 'userAgent');
    restoreWindowOpen();
  };
};

const openTheSheet = async (canvasElement: HTMLElement): Promise<HTMLElement> => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: consts.ADD_TO_CALENDAR_LABEL }));
  return within(document.body).findByRole('dialog', { name: sheetConsts.SHEET_TITLE });
};

const rowNamed = (dialog: HTMLElement, title: string): HTMLElement => within(dialog).getByRole('button', { name: new RegExp(title) });

// The sheet fades in, so presence rather than visibility.
const expectCalendarQuestion = async (dialog: HTMLElement): Promise<void> => {
  await expect(within(dialog).getByText(sheetConsts.CALENDAR_QUESTION)).toBeInTheDocument();
  await expect(rowNamed(dialog, sheetConsts.CALENDAR_CHOICE_COPY.google.title)).toBeInTheDocument();
  await expect(rowNamed(dialog, sheetConsts.CALENDAR_CHOICE_COPY.device.title)).toBeInTheDocument();
  await expect(within(dialog).queryByText(sheetConsts.ADD_ONE_TITLE)).toBeNull();
};

const expectScopeRows = async (dialog: HTMLElement): Promise<void> => {
  await expect(within(dialog).queryByText(sheetConsts.CALENDAR_QUESTION)).toBeNull();
  await expect(rowNamed(dialog, sheetConsts.ADD_ONE_TITLE)).toBeInTheDocument();
  await expect(rowNamed(dialog, sheetConsts.SUBSCRIBE_TITLE)).toBeInTheDocument();
  // The first row names the concrete date it adds.
  await expect(within(dialog).getByText('יום שלישי, 13 באוקטובר, בשעה 20:30')).toBeInTheDocument();
  await expect(within(dialog).getByText(sheetConsts.SUBSCRIBE_LINE)).toBeInTheDocument();
};

// Weekly: the calendar button first asks which calendar, not yet which scope.
export const WeeklyOpensAtTheCalendarQuestion: Story = {
  args: { occurrence: weekly },
  play: async ({ canvasElement }) => {
    await expectCalendarQuestion(await openTheSheet(canvasElement));
  },
};

export const WeeklyGoogleThenBack: Story = {
  args: { occurrence: weekly },
  play: async ({ canvasElement }) => {
    const dialog = await openTheSheet(canvasElement);
    await userEvent.click(rowNamed(dialog, sheetConsts.CALENDAR_CHOICE_COPY.google.title));

    await expectScopeRows(dialog);
    await expect(within(dialog).getByText(sheetConsts.CALENDAR_CHOICE_COPY.google.title)).toBeInTheDocument();
    await expect(dialog.querySelector('.chosenCalendar > .mark mask')).not.toBeNull();

    await userEvent.click(within(dialog).getByRole('button', { name: sheetConsts.BACK_LABEL }));
    await expectCalendarQuestion(dialog);
  },
};

export const WeeklyDeviceNamesItsChoice: Story = {
  args: { occurrence: weekly },
  play: async ({ canvasElement }) => {
    const dialog = await openTheSheet(canvasElement);
    await userEvent.click(rowNamed(dialog, sheetConsts.CALENDAR_CHOICE_COPY.device.title));

    await expectScopeRows(dialog);
    await expect(within(dialog).getByText(sheetConsts.CALENDAR_CHOICE_COPY.device.title)).toBeInTheDocument();
    await expect(dialog.querySelector('.chosenCalendar > .mark path[stroke="currentColor"]')).not.toBeNull();
  },
};

// Google, one lesson: a new tab with the prefilled event, and the sheet closes.
export const WeeklyGoogleOneLessonOpensTheEvent: Story = {
  args: { occurrence: weekly },
  beforeEach: stubWindowOpen,
  play: async ({ canvasElement }) => {
    const dialog = await openTheSheet(canvasElement);
    await userEvent.click(rowNamed(dialog, sheetConsts.CALENDAR_CHOICE_COPY.google.title));
    await userEvent.click(rowNamed(dialog, sheetConsts.ADD_ONE_TITLE));

    await expect(window.open).toHaveBeenCalledWith(expect.stringContaining(GOOGLE_EVENT_URL), '_blank', 'noopener,noreferrer');
    await expect(within(document.body).queryByRole('dialog')).toBeNull();
  },
};

export const WeeklyGoogleAllLessonsOpensTheSubscription: Story = {
  args: { occurrence: weekly },
  beforeEach: stubWindowOpen,
  play: async ({ canvasElement }) => {
    const dialog = await openTheSheet(canvasElement);
    await userEvent.click(rowNamed(dialog, sheetConsts.CALENDAR_CHOICE_COPY.google.title));
    await userEvent.click(rowNamed(dialog, sheetConsts.SUBSCRIBE_TITLE));

    await expect(window.open).toHaveBeenCalledWith(expect.stringContaining(GOOGLE_SUBSCRIBE_URL), '_blank', 'noopener,noreferrer');
    await expect(within(document.body).queryByRole('dialog')).toBeNull();
  },
};

// One-time lesson: the calendar question is the whole sheet, and one tap
// both opens the event and closes it.
export const OneTimeAsksOnlyWhichCalendar: Story = {
  args: { occurrence: oneTime },
  beforeEach: stubWindowOpen,
  play: async ({ canvasElement }) => {
    const dialog = await openTheSheet(canvasElement);
    await expectCalendarQuestion(dialog);

    await userEvent.click(rowNamed(dialog, sheetConsts.CALENDAR_CHOICE_COPY.google.title));
    await expect(window.open).toHaveBeenCalledWith(expect.stringContaining(GOOGLE_EVENT_URL), '_blank', 'noopener,noreferrer');
    await expect(within(document.body).queryByRole('dialog')).toBeNull();
  },
};

export const SheetCloses: Story = {
  args: { occurrence: weekly },
  play: async ({ canvasElement }) => {
    const dialog = await openTheSheet(canvasElement);
    await userEvent.click(within(dialog).getByRole('button', { name: sheetConsts.CLOSE_LABEL }));
    await expect(within(document.body).queryByRole('dialog')).toBeNull();
  },
};

// Closing from the second step, by any route, forgets the choice: the sheet
// always reopens at the calendar question.
export const ClosingAtTheSecondStepReopensAtTheFirst: Story = {
  args: { occurrence: weekly },
  play: async ({ canvasElement }) => {
    const dialog = await openTheSheet(canvasElement);
    await userEvent.click(rowNamed(dialog, sheetConsts.CALENDAR_CHOICE_COPY.google.title));
    await expectScopeRows(dialog);
    await userEvent.click(within(dialog).getByRole('button', { name: sheetConsts.CLOSE_LABEL }));
    await expect(within(document.body).queryByRole('dialog')).toBeNull();

    await expectCalendarQuestion(await openTheSheet(canvasElement));
  },
};

export const EscapeAtTheSecondStepReopensAtTheFirst: Story = {
  args: { occurrence: weekly },
  play: async ({ canvasElement }) => {
    const dialog = await openTheSheet(canvasElement);
    await userEvent.click(rowNamed(dialog, sheetConsts.CALENDAR_CHOICE_COPY.device.title));
    await expectScopeRows(dialog);
    await userEvent.keyboard('{Escape}');
    await expect(within(document.body).queryByRole('dialog')).toBeNull();

    await expectCalendarQuestion(await openTheSheet(canvasElement));
  },
};

// Android is never asked which calendar: a weekly lesson opens straight at
// the shipped two rows, with no way back and no calendar named, and both
// rows are Google links.
export const AndroidWeeklyGoesStraightToTheRows: Story = {
  args: { occurrence: weekly },
  beforeEach: stubAndroid,
  play: async ({ canvasElement }) => {
    const dialog = await openTheSheet(canvasElement);
    await expectScopeRows(dialog);
    await expect(within(dialog).queryByRole('button', { name: sheetConsts.BACK_LABEL })).toBeNull();
    await expect(dialog.querySelector('.chosenCalendar')).toBeNull();

    await userEvent.click(rowNamed(dialog, sheetConsts.SUBSCRIBE_TITLE));
    await expect(window.open).toHaveBeenCalledWith(expect.stringContaining(GOOGLE_SUBSCRIBE_URL), '_blank', 'noopener,noreferrer');
  },
};

// What is reported is the calendar actually used: Android was never asked
// and always sends google. The device subscription is a webcal link, which
// leaves the page where it is, so a story can tap it.
export const AndroidReportsGoogle: Story = {
  args: { occurrence: weekly },
  beforeEach: () => {
    mocked(trackEvent).mockClear();
    return stubAndroid();
  },
  play: async ({ canvasElement }) => {
    const dialog = await openTheSheet(canvasElement);
    await userEvent.click(rowNamed(dialog, sheetConsts.SUBSCRIBE_TITLE));
    await expect(trackEvent).toHaveBeenCalledWith(MIXPANEL_EVENTS.calendarSheetOpen, { kind: 'weekly' });
    await expect(trackEvent).toHaveBeenCalledWith(MIXPANEL_EVENTS.calendarAddClick, { kind: 'subscribe', calendar: 'google', target: 'google' });
  },
};

export const DeviceChoiceReportsDevice: Story = {
  args: { occurrence: weekly },
  beforeEach: () => {
    mocked(trackEvent).mockClear();
  },
  play: async ({ canvasElement }) => {
    const dialog = await openTheSheet(canvasElement);
    await userEvent.click(rowNamed(dialog, sheetConsts.CALENDAR_CHOICE_COPY.device.title));
    await userEvent.click(rowNamed(dialog, sheetConsts.SUBSCRIBE_TITLE));
    await expect(trackEvent).toHaveBeenCalledWith(MIXPANEL_EVENTS.calendarAddClick, { kind: 'subscribe', calendar: 'device', target: 'webcal' });
  },
};

// On Android a one-time lesson is added at once, with no sheet at all.
export const AndroidOneTimeAddsAtOnce: Story = {
  args: { occurrence: oneTime },
  beforeEach: stubAndroid,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: consts.ADD_TO_CALENDAR_LABEL }));
    await expect(window.open).toHaveBeenCalledWith(expect.stringContaining(GOOGLE_EVENT_URL), '_blank', 'noopener,noreferrer');
    await expect(within(document.body).queryByRole('dialog')).toBeNull();
  },
};

// Every date in the horizon is cancelled: nothing to add, the pattern is
// still shareable.
export const WeeklyWithNoCalendarDate: Story = {
  args: { occurrence: { ...weekly, status: 'cancelled', calendarOccurrence: null } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: SHARE_LABEL })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: consts.ADD_TO_CALENDAR_LABEL })).toBeNull();
  },
};

// A one-time lesson that is cancelled or over: the row is absent.
export const OneTimeGone: Story = {
  args: { occurrence: { ...upcoming, status: 'cancelled' } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.share, .calendar')).toBeNull();
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};

// The page's own side gutters (spacing.lg each side): the test frame has none
// of its own, so the row is measured in a frame that much narrower than the
// phone it stands for.
const PAGE_GUTTERS = 32;

const viewportAt = (width: number) =>
  ({
    globals: { viewport: { value: `phone${width}`, isRotated: false } },
    parameters: { viewport: { options: { [`phone${width}`]: { name: `Phone ${width}`, styles: { width: `${width}px`, height: '100%' }, type: 'mobile' } } } },
  }) as const;

const buttonsOf = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  return {
    share: canvas.getByRole('button', { name: SHARE_LABEL }).getBoundingClientRect(),
    calendar: canvas.getByRole('button', { name: consts.ADD_TO_CALENDAR_LABEL }).getBoundingClientRect(),
  };
};

// The two buttons share the row side by side at every phone width the site
// supports, 320 included. Equal halves hold wherever each label fits its
// half; at 320 the share button's own width (it reserves room for its longer
// "copied" label) is a little over half of 288, so there it takes what it
// needs and the calendar button the rest.
const sideBySideStory = (width: number, isEqualHalves: boolean): Story => ({
  args: { occurrence: weekly },
  ...viewportAt(width),
  play: ({ canvasElement }) =>
    atFrameSize(width - PAGE_GUTTERS, undefined, async () => {
      const { share, calendar } = buttonsOf(canvasElement);
      await expect(Math.abs(share.top - calendar.top)).toBeLessThanOrEqual(1);
      if (isEqualHalves) await expect(Math.abs(share.width - calendar.width)).toBeLessThanOrEqual(1);
      await expect(share.height).toBeGreaterThanOrEqual(48);
      await expect(calendar.height).toBeGreaterThanOrEqual(48);
    }),
});

export const SideBySideAt390: Story = sideBySideStory(390, true);
export const SideBySideAt360: Story = sideBySideStory(360, true);
export const SideBySideAt320: Story = sideBySideStory(320, false);

// A row too narrow for both labels (a narrow container, or text enlarged
// well past the default): the buttons stack, each the full width.
export const NarrowStacks: Story = {
  args: { occurrence: weekly },
  ...viewportAt(240),
  play: ({ canvasElement }) =>
    atFrameSize(240 - PAGE_GUTTERS, undefined, async () => {
      const { share, calendar } = buttonsOf(canvasElement);
      await expect(calendar.top).toBeGreaterThanOrEqual(share.bottom);
      await expect(Math.round(share.width)).toBe(Math.round(calendar.width));
    }),
};

// The copy did not work: the buttons stay where they were, and the line and
// the link field drop under both, at the row's width, without the page
// scrolling sideways.
const copyFailedStory = (width: number): Story => ({
  args: { occurrence: weekly },
  ...viewportAt(width),
  play: ({ canvasElement }) =>
    atFrameSize(width - PAGE_GUTTERS, undefined, async () => {
      const restoreClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
      const restoreShare = Object.getOwnPropertyDescriptor(navigator, 'share');
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new DOMException('blocked', 'NotAllowedError')) }, configurable: true });
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
      try {
        const canvas = within(canvasElement);
        const before = buttonsOf(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: SHARE_LABEL }));
        const line = await canvas.findByText(COPY_FAILED_LINE);
        const field = canvas.getByText(/torahbarabim\.com/);

        const after = buttonsOf(canvasElement);
        await expect(Math.abs(after.share.top - before.share.top)).toBeLessThanOrEqual(1);
        await expect(Math.abs(after.calendar.top - before.calendar.top)).toBeLessThanOrEqual(1);
        await expect(line.getBoundingClientRect().top).toBeGreaterThanOrEqual(Math.max(after.share.bottom, after.calendar.bottom));
        await expect(field.getBoundingClientRect().top).toBeGreaterThanOrEqual(line.getBoundingClientRect().bottom);
        await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
      } finally {
        if (restoreClipboard) Object.defineProperty(navigator, 'clipboard', restoreClipboard);
        else delete (navigator as unknown as Record<string, unknown>).clipboard;
        if (restoreShare) Object.defineProperty(navigator, 'share', restoreShare);
        else delete (navigator as unknown as Record<string, unknown>).share;
      }
    }),
});

export const CopyFailedAt390: Story = copyFailedStory(390);
export const CopyFailedAt320: Story = copyFailedStory(320);
