import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import * as consts from './consts';
import { CalendarSheet } from './CalendarSheet';

const meta: Meta<typeof CalendarSheet> = {
  title: 'LessonPage/CalendarSheet',
  component: CalendarSheet,
  args: { dateLabel: 'יום שלישי, 27 באוגוסט, בשעה 20:30', onAddOneEvent: fn(), onSubscribe: fn(), onDismiss: fn() },
};

export default meta;
type Story = StoryObj<typeof CalendarSheet>;

// The sheet renders into the page body, outside the story canvas.
const sheet = (): Promise<HTMLElement> => within(document.body).findByRole('dialog', { name: consts.SHEET_TITLE });

export const Open: Story = {
  play: async ({ args }) => {
    const dialog = await sheet();
    await userEvent.click(within(dialog).getByRole('button', { name: new RegExp(consts.ADD_ONE_TITLE) }));
    await expect(args.onAddOneEvent).toHaveBeenCalledTimes(1);
    await userEvent.click(within(dialog).getByRole('button', { name: new RegExp(consts.SUBSCRIBE_TITLE) }));
    await expect(args.onSubscribe).toHaveBeenCalledTimes(1);
  },
};

// The longest date the site can phrase, on the narrowest phone: it wraps in
// its row rather than overflowing.
export const LongDate: Story = {
  args: { dateLabel: 'יום רביעי, 30 בספטמבר, בשעה 06:00' },
  globals: { viewport: { value: 'narrow', isRotated: false } },
  parameters: { viewport: { options: { narrow: { name: 'Narrow 320', styles: { width: '320px', height: '100%' }, type: 'mobile' } } } },
  play: async () => {
    const dialog = await sheet();
    await expect(dialog.scrollWidth).toBeLessThanOrEqual(dialog.clientWidth);
  },
};
