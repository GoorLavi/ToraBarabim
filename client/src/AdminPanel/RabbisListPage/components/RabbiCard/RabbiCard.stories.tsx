import type { Meta, StoryObj } from '@storybook/react-vite';

import { rabbiFixture } from '~/rabbiFixture';
import { placeholderPhoto } from '~/storyMocks';

import { RabbiCard } from './RabbiCard';

// A plain component fed straight from props, no data fetching of its own,
// so no route or mock fetch is needed.
const meta: Meta<typeof RabbiCard> = {
  title: 'AdminPanel/RabbiCard',
  component: RabbiCard,
};

export default meta;
type Story = StoryObj<typeof RabbiCard>;

// The ratified 3:4 poster (design-system.md corrected this from a stale
// 2:3): the first thing to check here is the photo's own proportions.
export const WithPhoto: Story = {
  args: {
    row: {
      // A horizon and a corner mark, not a flat fill, so a reviewer can
      // actually judge how the poster crops the photo (design gate round 6).
      rabbi: rabbiFixture({ id: 'r1', name: 'אליהו בן דוד', title: 'ראש כולל', photoUrl: placeholderPhoto(240, 320) }),
      lessonCount: 4,
    },
  },
};

export const NoPhoto: Story = {
  args: {
    // Pinned rather than left to default, now that rabbiFixture fills in a
    // placeholder photo when the key is absent (design gate finding F10):
    // this story exists specifically to show the missing-poster fallback.
    row: { rabbi: rabbiFixture({ id: 'r2', name: 'משה לוי', photoUrl: undefined }), lessonCount: 2 },
  },
};

export const NoLessons: Story = {
  args: {
    row: { rabbi: rabbiFixture({ id: 'r3', name: 'שרה גולדברג', honorific: 'rabbanit' }), lessonCount: 0 },
  },
};

export const ManyLessons: Story = {
  args: {
    row: { rabbi: rabbiFixture({ id: 'r4', name: 'נתן צבי אשכנזי הכהן' }), lessonCount: 37 },
  },
};
