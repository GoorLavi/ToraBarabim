import type { Meta, StoryObj } from '@storybook/react-vite';

import { WomensAreaTile } from './WomensAreaTile';

const meta: Meta<typeof WomensAreaTile> = {
  title: 'HomePage/WomensAreaTile',
  component: WomensAreaTile,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '200px', blockSize: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WomensAreaTile>;

export const Normal: Story = { args: { lessonCount: 12 } };
export const Singular: Story = { args: { lessonCount: 1 } };

// The tile stretches into its list item's own height, set by the tallest
// lesson card in the row: at 240px wide it carries the larger emblem.
export const WideCell: Story = {
  args: { lessonCount: 5 },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '240px', blockSize: '360px' }}>
        <Story />
      </div>
    ),
  ],
};
