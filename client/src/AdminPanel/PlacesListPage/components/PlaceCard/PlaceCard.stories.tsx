import type { AdminPlaceResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PlaceCard } from './PlaceCard';

const meta: Meta<typeof PlaceCard> = {
  title: 'AdminPanel/PlaceCard',
  component: PlaceCard,
};

export default meta;
type Story = StoryObj<typeof PlaceCard>;

const place = (overrides: Partial<AdminPlaceResponse>): AdminPlaceResponse => ({
  id: 'p1',
  slug: 'p1',
  name: 'בית כנסת שלום',
  street: 'רחוב וייצמן 3',
  cityCode: 4000,
  cityName: 'חיפה',
  area: 'haifa',
  isActive: true,
  ...overrides,
});

export const Active: Story = { args: { place: place({}) } };

export const Inactive: Story = { args: { place: place({ id: 'p2', isActive: false }) } };

// Layouts must survive real data (design-system.md).
export const LongName: Story = {
  args: {
    place: place({
      id: 'p3',
      name: 'בית הכנסת המרכזי אהל יצחק ומאיר',
      street: 'שדרות ירושלים הבירה הנצחית של עם ישראל 128',
      cityName: 'קרית מלאכי',
    }),
  },
};
