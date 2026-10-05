import type { CityWithLessonCount } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { CityGrid } from './CityGrid';

const city = (id: string, name: string, lessonCount: number, area: CityWithLessonCount['area'] = 'center'): CityWithLessonCount => ({
  id,
  name,
  slug: name,
  area,
  lessonCount,
});

const CITIES: CityWithLessonCount[] = [
  city('5000', 'תל אביב-יפו', 48, 'telAviv'),
  city('3000', 'ירושלים', 41, 'jerusalem'),
  city('4000', 'חיפה', 22, 'haifa'),
  city('7400', 'נתניה', 17, 'sharon'),
  city('70', 'באר שבע', 14, 'south'),
  city('8300', 'ראשון לציון', 12),
  city('6100', 'בני ברק', 9),
  city('1', 'קריית שמונה', 6, 'north'),
  city('2', 'מודיעין-מכבים-רעות', 4),
  city('3', 'יבנה', 1, 'shfela'),
];

const meta: Meta<typeof CityGrid> = {
  title: 'HomePage/CityGrid',
  component: CityGrid,
  args: { cities: CITIES, isLoading: false, isError: false, selectedCityId: undefined, onSelectCity: fn(), onClearCity: fn() },
};

export default meta;
type Story = StoryObj<typeof CityGrid>;

export const Populated: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: /ירושלים/ }));

    expect(args.onSelectCity).toHaveBeenCalledWith({ id: '3000', name: 'ירושלים' });
  },
};

export const Selected: Story = {
  args: { selectedCityId: '4000' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const selectedChip = await canvas.findByRole('button', { name: /חיפה/ });

    expect(selectedChip).toHaveAttribute('aria-pressed', 'true');
    expect(canvas.getByRole('button', { name: /ירושלים/ })).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(selectedChip);

    expect(args.onClearCity).toHaveBeenCalledTimes(1);
    expect(args.onSelectCity).not.toHaveBeenCalled();
  },
};

export const Loading: Story = { args: { cities: undefined, isLoading: true } };

export const ErrorState: Story = { args: { cities: undefined, isError: true } };

// Nothing to show renders nothing at all, heading included.
export const Empty: Story = { args: { cities: [] } };

export const LongName: Story = {
  args: {
    cities: [
      city('9', 'קריית ים וקריית מוצקין ורמת הנשיא המורחבת שבצפון', 12, 'haifa'),
      city('10', 'תל אביב-יפו', 1, 'telAviv'),
      city('11', 'פרדס חנה-כרכור', 3000),
      city('12', 'אום אל-פחם', 7, 'haifa'),
    ],
  },
};
