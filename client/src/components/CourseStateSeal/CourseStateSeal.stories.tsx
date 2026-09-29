import type { Meta, StoryObj } from '@storybook/react-vite';

import { CourseStateSeal } from './CourseStateSeal';

// A poster-sized block standing in for the `position: relative` container
// every real caller already has (`CourseCard`'s and `CoursePreviewCard`'s
// own `.poster`), since the seal is positioned absolutely against it.
const withPosterFrame = (Story: React.ComponentType) => (
  <div style={{ position: 'relative', width: '232px', height: '309px', background: '#f4f1ee' }}>
    <Story />
  </div>
);

const meta: Meta<typeof CourseStateSeal> = {
  title: 'components/CourseStateSeal',
  component: CourseStateSeal,
  decorators: [withPosterFrame],
};

export default meta;
type Story = StoryObj<typeof CourseStateSeal>;

export const Open: Story = {
  args: { small: 'ההרשמה', big: 'פתוחה', isClosed: false },
};

export const Full: Story = {
  args: { small: 'תפוסה', big: 'מלאה', isClosed: true },
};

export const Closed: Story = {
  args: { small: 'ההרשמה', big: 'נסגרה', isClosed: true },
};
