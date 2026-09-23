import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { DEDICATION_GROUP_HEALING, DEDICATION_GROUP_OVERFLOWING, DEDICATION_GROUP_SINGLE } from '~/dedicationFixture';

import { DedicationBand } from './DedicationBand';

// Forces `prefers-reduced-motion: reduce` for the one story that needs it,
// restored on unmount so it never leaks into a later story. Storybook has
// no built-in way to flip this media query per story.
const withReducedMotion = (Story: () => ReactNode) => {
  const ForcedReducedMotion = (): ReactNode => {
    useEffect(() => {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = ((query: string) =>
        originalMatchMedia.call(window, query === '(prefers-reduced-motion: reduce)' ? 'all' : query)) as typeof window.matchMedia;
      return () => {
        window.matchMedia = originalMatchMedia;
      };
    }, []);
    return <Story />;
  };
  return <ForcedReducedMotion />;
};

const meta: Meta<typeof DedicationBand> = {
  title: 'HomePage/DedicationBand',
  component: DedicationBand,
};

export default meta;
type Story = StoryObj<typeof DedicationBand>;

export const OnPrimaryOneUnit: Story = {
  args: { group: DEDICATION_GROUP_SINGLE, variant: 'onPrimary' },
  decorators: [(Story) => <div style={{ background: '#521827' }}><Story /></div>],
};

export const OnPageOneUnit: Story = {
  args: { group: DEDICATION_GROUP_SINGLE, variant: 'onPage' },
};

// Static, no self-advance: the group's own width fits the container.
export const FitsNoCrawl: Story = {
  args: { group: DEDICATION_GROUP_HEALING, variant: 'onPage' },
};

// Wider than the container: crawls.
export const OverflowsAndCrawls: Story = {
  args: { group: DEDICATION_GROUP_OVERFLOWING, variant: 'onPage' },
};

export const OnPrimaryOverflowing: Story = {
  args: { group: DEDICATION_GROUP_OVERFLOWING, variant: 'onPrimary' },
  decorators: [(Story) => <div style={{ background: '#521827' }}><Story /></div>],
};

// Never self-advances, but stays scrollable (design-system.md, dedication
// interaction rule 6): a long group here still has no way to auto-advance,
// but a reader can still reach every name by scrolling manually.
export const ReducedMotionStaysScrollable: Story = {
  args: { group: DEDICATION_GROUP_OVERFLOWING, variant: 'onPage' },
  decorators: [withReducedMotion],
};

// Renders nothing at all, not an empty band: covers both "the draw has not
// run yet" and "the pool is genuinely empty", `dedications: []` is a normal
// 200, never a 404 (design-system.md, dedication States).
export const NoDedicationsRendersNothing: Story = {
  args: { group: undefined, variant: 'onPage' },
};
