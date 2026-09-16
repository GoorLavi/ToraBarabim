import type { Meta, StoryObj } from '@storybook/react-vite';

import { WomensAreaBand } from './WomensAreaBand';

const meta: Meta<typeof WomensAreaBand> = {
  title: 'HomePage/WomensAreaBand',
  component: WomensAreaBand,
};

export default meta;
type Story = StoryObj<typeof WomensAreaBand>;

export const Normal: Story = { args: { lessonCount: 12 } };
export const Singular: Story = { args: { lessonCount: 1 } };
