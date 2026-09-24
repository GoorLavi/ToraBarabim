import type { Meta, StoryObj } from '@storybook/react-vite';

import { courseFixture } from '~/courseFixture';
import { rabbiFixture } from '~/rabbiFixture';

import { CourseCard } from './CourseCard';

const withWidth = (widthPx: number) => (Story: React.ComponentType) => (
  <div style={{ maxWidth: `${widthPx}px` }}>
    <Story />
  </div>
);

const meta: Meta<typeof CourseCard> = {
  title: 'components/CourseCard',
  component: CourseCard,
  args: { clickContext: { surface: 'homeRail', position: 0 } },
  decorators: [withWidth(232)],
};

export default meta;
type Story = StoryObj<typeof CourseCard>;

export const Open: Story = {
  args: { course: courseFixture({ name: 'יסודות האמונה', state: { status: 'open' } }) },
};

export const NotOpen: Story = {
  args: { course: courseFixture({ name: 'יסודות האמונה', openingDate: '2027-03-01', state: { status: 'notOpen' } }) },
};

export const Full: Story = {
  args: { course: courseFixture({ name: 'יסודות האמונה', state: { status: 'closed', reason: 'full', closedOn: '2026-10-20' } }) },
};

export const Closed: Story = {
  args: { course: courseFixture({ name: 'יסודות האמונה', state: { status: 'closed', reason: 'closed', closedOn: '2026-10-20' } }) },
};

// A free-text (unlinked) teacher: no rabbi record, no honorific.
export const UnlinkedTeacher: Story = {
  args: { course: courseFixture({ name: 'סדנת הכנה לחתונה', teacher: { kind: 'named', name: 'צוות המרכז הקהילתי' } }) },
};

// A rabbanit-linked course, and a long course name, at the narrow phone
// tier (below the card's own wide threshold): the title truncates to one
// line, the opening date switches to its compact numeric form.
export const LongNamePhoneTier: Story = {
  decorators: [withWidth(163)],
  args: {
    course: courseFixture({
      name: 'קורס עיוני מקיף בהלכות שבת ומועדים לנשים ולבנות, מהבסיס ועד רמה מתקדמת',
      teacher: { kind: 'rabbi', rabbi: rabbiFixture({ id: 'story-rabbanit', name: 'שרה גולדברג', honorific: 'rabbanit' }) },
      audience: 'women',
    }),
  },
};
