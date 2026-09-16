import type { Meta, StoryObj } from '@storybook/react-vite';

import { WomensAreaTile } from './WomensAreaTile';

const meta: Meta<typeof WomensAreaTile> = {
  title: 'HomePage/WomensAreaTile',
  component: WomensAreaTile,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '164px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WomensAreaTile>;

export const Normal: Story = { args: { lessonCount: 12 } };
export const Singular: Story = { args: { lessonCount: 1 } };

// The tile sets its own height from its width now (styles.ts): at 296px
// wide (the rail's own card width at 1280, LessonRail/helpers.ts) it
// carries the larger emblem and a taller plum area, not a height borrowed
// from a neighbouring card.
export const WideCell: Story = {
  args: { lessonCount: 5 },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '296px' }}>
        <Story />
      </div>
    ),
  ],
};
