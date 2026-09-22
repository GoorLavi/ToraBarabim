import type { Place } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { placeholderPhoto } from '~/storyMocks';

import { PlaceHero } from './PlaceHero';

// A horizon and a corner mark, not a flat fill, so a reviewer can actually
// judge how the hero crops the photo (design gate round 6): the two stories
// where that matters are exactly this one and AdminPanel/RabbiCard's.
const PLACEHOLDER_PHOTO = placeholderPhoto(320, 180);

const place = (overrides: Partial<Place>): Place => ({
  id: 'place-1',
  slug: 'בית-הכנסת-המרכזי',
  name: 'בית הכנסת המרכזי',
  street: 'רחוב ויצמן 45',
  city: 'נתניה',
  citySlug: 'נתניה',
  area: 'sharon',
  lessonCount: 3,
  ...overrides,
});

const meta: Meta<typeof PlaceHero> = {
  title: 'PlacePage/PlaceHero',
  component: PlaceHero,
};

export default meta;
type Story = StoryObj<typeof PlaceHero>;

export const WithPhoto: Story = {
  args: { place: place({ photoUrl: PLACEHOLDER_PHOTO }), lessonCount: 3 },
};

// The card's structural "no data yet" case: with no photo the band does not
// exist at all, no placeholder and no reserved space (build brief).
export const NoPhoto: Story = {
  args: { place: place({}), lessonCount: 3 },
};

export const WithFloor: Story = {
  args: { place: place({ photoUrl: PLACEHOLDER_PHOTO, floor: 'קומה 2, דלת שמאל' }), lessonCount: 1 },
};

// The lesson count is still loading (PlacePage's own lessons fetch has not
// resolved yet): the meta line simply does not render, no placeholder bar.
export const CountNotYetKnown: Story = {
  args: { place: place({ photoUrl: PLACEHOLDER_PHOTO }), lessonCount: undefined },
};

export const NoLessons: Story = {
  args: { place: place({ photoUrl: PLACEHOLDER_PHOTO }), lessonCount: 0 },
};

export const LongName: Story = {
  args: {
    place: place({
      name: 'בית הכנסת המרכזי אהל יצחק ומאיר',
      street: 'שדרות ירושלים הארוכה במיוחד לצורך הבדיקה של השורה הזאת 128',
      city: 'קריית מלאכי והמושבים הסמוכים לה בעוטף עזה',
      photoUrl: PLACEHOLDER_PHOTO,
    }),
    lessonCount: 12,
  },
};
