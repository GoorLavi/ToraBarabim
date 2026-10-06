import type { LessonOccurrenceDetail } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { rabbiFixture } from '~/rabbiFixture';

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

const SHARE_NAME = 'שיתוף';

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
    await expect(canvas.getByRole('button', { name: SHARE_NAME })).toBeVisible();
    await expect(canvas.getByRole('button', { name: consts.ADD_TO_CALENDAR_LABEL })).toBeVisible();
  },
};

// Weekly: the calendar button asks which of the two it should be.
export const WeeklyOpensTheSheet: Story = {
  args: { occurrence: weekly },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: consts.ADD_TO_CALENDAR_LABEL }));

    const dialog = await within(document.body).findByRole('dialog', { name: sheetConsts.SHEET_TITLE });
    await expect(within(dialog).getByRole('button', { name: new RegExp(sheetConsts.ADD_ONE_TITLE) })).toBeInTheDocument();
    await expect(within(dialog).getByRole('button', { name: new RegExp(sheetConsts.SUBSCRIBE_TITLE) })).toBeInTheDocument();
    // The sheet fades in, so presence rather than visibility. The first
    // choice names the concrete date it adds.
    await expect(within(dialog).getByText('יום שלישי, 13 באוקטובר, בשעה 20:30')).toBeInTheDocument();
    await expect(within(dialog).getByText(sheetConsts.SUBSCRIBE_LINE)).toBeInTheDocument();
  },
};

export const SheetCloses: Story = {
  args: { occurrence: weekly },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: consts.ADD_TO_CALENDAR_LABEL }));
    const dialog = await within(document.body).findByRole('dialog', { name: sheetConsts.SHEET_TITLE });
    await userEvent.click(within(dialog).getByRole('button', { name: sheetConsts.CLOSE_LABEL }));
    await expect(within(document.body).queryByRole('dialog')).toBeNull();
  },
};

// Every date in the horizon is cancelled: nothing to add, the pattern is
// still shareable.
export const WeeklyWithNoCalendarDate: Story = {
  args: { occurrence: { ...weekly, status: 'cancelled', calendarOccurrence: null } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: SHARE_NAME })).toBeVisible();
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

// 320 leaves 288 for the row: the two labels no longer fit side by side, so
// they stack, each the full width.
export const NarrowStacks: Story = {
  args: { occurrence: weekly },
  globals: { viewport: { value: 'narrow', isRotated: false } },
  parameters: { viewport: { options: { narrow: { name: 'Narrow 320', styles: { width: '320px', height: '100%' }, type: 'mobile' } } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const share = canvas.getByRole('button', { name: SHARE_NAME }).getBoundingClientRect();
    const calendar = canvas.getByRole('button', { name: consts.ADD_TO_CALENDAR_LABEL }).getBoundingClientRect();
    await expect(calendar.top).toBeGreaterThanOrEqual(share.bottom);
    await expect(Math.round(share.width)).toBe(Math.round(calendar.width));
  },
};
