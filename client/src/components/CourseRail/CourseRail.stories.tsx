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
    // Both ids given explicitly: courseFixture's own auto-increment is a
    // module-level counter shared across every story in the run, so a
    // literal id here ("course-2") could otherwise collide with whichever
    // count it has reached (the duplicate React key the design gate found).
    items: [courseFixture({ id: 'two-courses-1', name: 'יסודות האמונה' }), courseFixture({ id: 'two-courses-2', name: 'עיון בהלכות שבת' })],
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
