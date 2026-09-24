import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect } from 'storybook/test';

import { ARGAMAN_VE_ZAHAV_THEME } from '~/theme/themes';

import { Chevron } from './Chevron';

const { colors } = ARGAMAN_VE_ZAHAV_THEME;

// This component draws only the glyph; every caller sizes it through its
// own `> .chevron` selector (TextLink/styles.ts, WomensAreaTile/styles.ts,
// DedicationBand/styles.ts all size it 7x12), so the story applies that
// same size and a `color` to demonstrate the `currentColor` stroke, rather
// than leaving it at the browser's own unstyled SVG default.
const sizedAndColoured = (color: string) => (Story: () => ReactNode) => (
  <div style={{ inlineSize: '7px', blockSize: '12px', color }}>
    <Story />
  </div>
);

const meta: Meta<typeof Chevron> = {
  title: 'HomePage/Chevron',
  component: Chevron,
};

export default meta;
type Story = StoryObj<typeof Chevron>;

export const OnPage: Story = {
  decorators: [sizedAndColoured(colors.primary)],
};

export const OnPrimary: Story = {
  decorators: [sizedAndColoured(colors.textOnPrimary)],
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg.chevron');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  },
};
