import type { Meta, StoryObj } from '@storybook/react-vite';

import { CourseCardSkeleton } from './CourseCardSkeleton';

const meta: Meta<typeof CourseCardSkeleton> = {
  title: 'components/CourseCardSkeleton',
  component: CourseCardSkeleton,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '232px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CourseCardSkeleton>;

export const Default: Story = {};
