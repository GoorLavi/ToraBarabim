import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { RailItemShell } from './RailItemShell';
import type { RailItemLook } from './models';

// A rail item's own width at a 375 screen is about 164: the width the shell
// is judged at, beside a row-mate that is taller than it.
const ITEM_WIDTH = '164px';
const ROW_HEIGHT = '360px';

interface ShellDemoProps {
  look: RailItemLook;
  hasTopArea: boolean;
}

// The shell's root element is the caller's choice; a plain div is enough to
// judge its box. The row-mate beside it is what forces the row's height, the
// way a card with a wrapped title does in a real rail.
const ShellDemo = ({ look, hasTopArea }: ShellDemoProps) => (
  <div style={{ display: 'flex', gap: '8px', blockSize: ROW_HEIGHT }}>
    <div data-testid="slot" style={{ inlineSize: ITEM_WIDTH }}>
      <RailItemShell
        {...{
          ...look,
          topArea: hasTopArea ? <div style={{ blockSize: '100%', background: 'rgba(107, 36, 54, 0.4)' }} /> : undefined,
          renderRoot: (rootClassName, content) => (
            <div className={rootClassName} data-testid="shell">
              {content}
            </div>
          ),
        }}
      >
        <div style={{ padding: '12px' }}>Content</div>
      </RailItemShell>
    </div>
    <div style={{ inlineSize: ITEM_WIDTH, blockSize: ROW_HEIGHT, border: '1px dashed gray' }} />
  </div>
);

const meta: Meta<typeof ShellDemo> = {
  title: 'HomePage/RailItemShell',
  component: ShellDemo,
};

export default meta;
type Story = StoryObj<typeof ShellDemo>;

// The one property the shell exists for: whatever fills it, it is as tall as
// its row, never shorter and never the thing that makes the row taller.
const expectShellFillsItsSlot = async (canvasElement: HTMLElement): Promise<void> => {
  const canvas = within(canvasElement);
  const slot = canvas.getByTestId('slot');
  const shell = canvas.getByTestId('shell');
  await expect(shell.getBoundingClientRect().height).toBeCloseTo(slot.getBoundingClientRect().height, 1);
  await expect(slot.getBoundingClientRect().height).toBeCloseTo(parseFloat(ROW_HEIGHT), 1);
};

export const Surface: Story = {
  args: { look: { variant: 'surface' }, hasTopArea: false },
  play: async ({ canvasElement }) => {
    await expectShellFillsItsSlot(canvasElement);
    const style = getComputedStyle(within(canvasElement).getByTestId('shell'));
    await expect(style.borderTopWidth).toBe('1px');
    await expect(style.boxShadow).not.toBe('none');
  },
};

export const SurfaceWithTopArea: Story = {
  args: { look: { variant: 'surface' }, hasTopArea: true },
  play: async ({ canvasElement }) => {
    await expectShellFillsItsSlot(canvasElement);
    const shell = within(canvasElement).getByTestId('shell');
    const topArea = shell.querySelector('.topArea');
    if (!topArea) throw new Error('RailItemShell story: .topArea not found');
    // 3:4 of the shell's own inner width, and it never stretches with the row.
    await expect(topArea.getBoundingClientRect().height).toBeCloseTo((topArea.getBoundingClientRect().width * 4) / 3, 0);
  },
};

// No border and no shadow: the look that says "not a listing".
export const TintedPrimarySoft: Story = {
  args: { look: { variant: 'tinted', tint: 'primarySoft' }, hasTopArea: false },
  play: async ({ canvasElement }) => {
    await expectShellFillsItsSlot(canvasElement);
    const style = getComputedStyle(within(canvasElement).getByTestId('shell'));
    await expect(style.boxShadow).toBe('none');
    await expect(style.borderTopColor).toBe('rgba(0, 0, 0, 0)');
    await expect(style.backgroundColor).not.toBe('rgb(255, 255, 255)');
  },
};

export const TintedAccentSoft: Story = {
  args: { look: { variant: 'tinted', tint: 'accentSoft' }, hasTopArea: false },
  play: async ({ canvasElement }) => {
    await expectShellFillsItsSlot(canvasElement);
    await expect(getComputedStyle(within(canvasElement).getByTestId('shell')).boxShadow).toBe('none');
  },
};

export const TintedWithTopArea: Story = {
  args: { look: { variant: 'tinted', tint: 'primarySoft' }, hasTopArea: true },
  play: async ({ canvasElement }) => {
    await expectShellFillsItsSlot(canvasElement);
  },
};
