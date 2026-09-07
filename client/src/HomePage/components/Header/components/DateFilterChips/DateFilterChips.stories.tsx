import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import styled from 'styled-components';

import { todayInIsrael } from '~/HomePage/helpers';

import { MAX_MONTHS_AHEAD } from './components/HebrewDatePicker/consts';
import * as pickerHelpers from './components/HebrewDatePicker/helpers';
import type { YearMonth } from './components/HebrewDatePicker/models';
import { DateFilterChips } from './DateFilterChips';

const TODAY = todayInIsrael();

const noop = (): void => {};

// The chips are white-on-transparent by design: they sit on the header's own
// plum band (Header/styles.ts), not on Storybook's near-white canvas. Without
// this backdrop EmptyClosed and ChosenClosed render white-on-white and their
// contrast is unreviewable.
const HeaderBand = styled.div(
  ({ theme }) => `
    background: ${theme.colors.primary};
    padding: ${theme.spacing.lg};
  `,
);

const meta: Meta<typeof DateFilterChips> = {
  title: 'HomePage/DateFilterChips',
  component: DateFilterChips,
  decorators: [
    (Story) => (
      <HeaderBand>
        <Story />
      </HeaderBand>
    ),
  ],
  args: {
    option: 'all',
    customDate: undefined,
    onSelectOption: noop,
    onSelectCustomDate: noop,
    onClearDate: noop,
  },
};

export default meta;
type Story = StoryObj<typeof DateFilterChips>;

const openTrigger = async (canvasElement: HTMLElement): Promise<ReturnType<typeof within>> => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: /בחירת תאריך אחר|שינוי התאריך/ }));
  return canvas;
};

export const EmptyClosed: Story = {};

export const EmptyOpen: Story = {
  play: async ({ canvasElement }) => {
    await openTrigger(canvasElement);
  },
};

export const ChosenClosed: Story = {
  args: { option: 'custom', customDate: TODAY },
};

export const ChosenOpen: Story = {
  args: { option: 'custom', customDate: TODAY },
  play: async ({ canvasElement }) => {
    await openTrigger(canvasElement);
  },
};

// The first month, starting from the current one, whose calendar genuinely
// spans all six rows: found once at module load, not hardcoded, so this
// story never goes stale (matches how LessonsSection.stories.tsx derives
// its dates from `todayInIsrael` rather than a literal string).
const findSixRowMonth = (): YearMonth => {
  let month = pickerHelpers.yearMonthFromIso(TODAY);
  for (let offset = 0; offset <= MAX_MONTHS_AHEAD; offset += 1) {
    if (pickerHelpers.needsSixPopulatedRows(month)) return month;
    month = pickerHelpers.addMonths(month, 1);
  }
  return pickerHelpers.yearMonthFromIso(TODAY);
};

// A chosen date opens the picker straight onto that date's month (build
// spec, section 3), so seeding the target month here is faster and just as
// real as paging to it: it exercises the same "open on this month" path the
// tap-to-open behaviour relies on, without twelve slow userEvent clicks.
const SIX_ROW_MONTH_DATE = pickerHelpers.isoOfYearMonthDay(findSixRowMonth(), 1);

const FORWARD_BOUND_MONTH_DATE = pickerHelpers.isoOfYearMonthDay(
  pickerHelpers.addMonths(pickerHelpers.yearMonthFromIso(TODAY), MAX_MONTHS_AHEAD),
  1,
);

export const SixRowMonth: Story = {
  args: { option: 'custom', customDate: SIX_ROW_MONTH_DATE },
  play: async ({ canvasElement }) => {
    await openTrigger(canvasElement);
  },
};

export const PreviousMonthDisabledAtCurrentMonth: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await openTrigger(canvasElement);
    await expect(canvas.getByRole('button', { name: 'לחודש הקודם' })).toBeDisabled();
  },
};

export const NextMonthDisabledAtForwardBound: Story = {
  args: { option: 'custom', customDate: FORWARD_BOUND_MONTH_DATE },
  play: async ({ canvasElement }) => {
    const canvas = await openTrigger(canvasElement);
    await expect(canvas.getByRole('button', { name: 'לחודש הבא' })).toBeDisabled();
  },
};
