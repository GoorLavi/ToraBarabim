import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import styled from 'styled-components';

import { atFrameSize } from '~/storyMocks';

import { MAX_MONTHS_AHEAD } from './components/HebrewDatePicker/consts';
import * as pickerHelpers from './components/HebrewDatePicker/helpers';
import type { YearMonth } from './components/HebrewDatePicker/models';
import { DateFilterChips } from './DateFilterChips';

// Pinned, with the clock frozen to it in `beforeEach`, so every story renders
// the same calendar on any day. In the past on purpose: a broken freeze then
// fails the forward-bound story instead of passing until the month turns.
// 09:00 UTC is midday in Israel, so the Israel date is `TODAY` in any browser
// timezone.
const TODAY = '2026-03-15';
const FROZEN_NOW_MS = Date.parse(`${TODAY}T09:00:00Z`);

const freezeClock = (): (() => void) => {
  const RealDate = globalThis.Date;
  globalThis.Date = new Proxy(RealDate, {
    construct: (target, args, newTarget) =>
      args.length === 0 ? new target(FROZEN_NOW_MS) : Reflect.construct(target, args, newTarget),
    get: (target, property, receiver) => (property === 'now' ? () => FROZEN_NOW_MS : Reflect.get(target, property, receiver)),
  });
  return () => {
    globalThis.Date = RealDate;
  };
};

const noop = (): void => {};

// The chips are white-on-transparent by design: they sit on FilterControls's
// own plum band (FilterControls/styles.ts), not on Storybook's near-white
// canvas. Without this backdrop EmptyClosed and ChosenClosed render
// white-on-white and their contrast is unreviewable.
const HeaderBand = styled.div(
  ({ theme }) => `
    background: ${theme.colors.primary};
    padding: ${theme.spacing.lg};
  `,
);

const meta: Meta<typeof DateFilterChips> = {
  title: 'FilterControls/DateFilterChips',
  component: DateFilterChips,
  beforeEach: freezeClock,
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

// Looked up from `document.body`, never from the canvas: below `md` the
// picker is `DateFilterSheet`, which portals out of the story root. Above it
// the picker is an in-place popover, which `document.body` contains as well.
const findPicker = async (): Promise<ReturnType<typeof within>> =>
  within(await within(document.body).findByRole('dialog', { name: 'בחירת תאריך' }));

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
// spans all six rows: searched rather than written out, so moving `TODAY`
// never silently breaks the six-row story.
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
    await openTrigger(canvasElement);
    const picker = await findPicker();
    await expect(picker.getByRole('button', { name: 'לחודש הקודם' })).toBeDisabled();
  },
};

export const NextMonthDisabledAtForwardBound: Story = {
  args: { option: 'custom', customDate: FORWARD_BOUND_MONTH_DATE },
  play: async ({ canvasElement }) => {
    await openTrigger(canvasElement);
    const picker = await findPicker();
    await expect(picker.getByRole('button', { name: 'לחודש הבא' })).toBeDisabled();
  },
};

// Below `md` the picker is `DateFilterSheet`, `ResponsiveSheet`'s own portal,
// so this forces the iframe narrow rather than relying on the runner's
// default width.
export const PhoneWidthEscapeClosesTheSheet: Story = {
  play: ({ canvasElement }) =>
    atFrameSize(375, undefined, async () => {
      const canvas = await openTrigger(canvasElement);
      await findPicker();

      await userEvent.keyboard('{Escape}');

      expect(within(document.body).queryByRole('dialog', { name: 'בחירת תאריך' })).not.toBeInTheDocument();
      await expect(canvas.getByRole('button', { name: 'בחירת תאריך אחר' })).toHaveFocus();
    }),
};
