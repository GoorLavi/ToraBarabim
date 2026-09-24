import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { courseFixture } from '~/courseFixture';

import { CourseRail } from './CourseRail';

const meta: Meta<typeof CourseRail> = {
  title: 'components/CourseRail',
  component: CourseRail,
  args: { title: 'קורסים', surface: 'homeRail' },
};

export default meta;
type Story = StoryObj<typeof CourseRail>;

// One course: ends flush, no "מה זה קורס?" tile or any other filler item
// (2026-09-25 amendment, dropping the tile that an earlier round drew).
export const OneCourse: Story = {
  args: { items: [courseFixture({ name: 'יסודות האמונה' })] },
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole('listitem');
    await expect(items).toHaveLength(1);
  },
};

export const TwoCourses: Story = {
  args: {
    items: [courseFixture({ name: 'יסודות האמונה' }), courseFixture({ name: 'עיון בהלכות שבת', id: 'course-2' })],
  },
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole('listitem');
    await expect(items).toHaveLength(2);
  },
};

export const ManyCourses: Story = {
  args: {
    items: Array.from({ length: 6 }, (_, index) => courseFixture({ id: `course-${index + 1}`, name: `קורס מספר ${index + 1}` })),
  },
};
