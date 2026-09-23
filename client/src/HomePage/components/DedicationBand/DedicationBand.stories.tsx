import type { DedicationGroup } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { expect, waitFor } from 'storybook/test';

import { DEDICATION_GROUP_HEALING, DEDICATION_GROUP_OVERFLOWING, DEDICATION_GROUP_SINGLE } from '~/dedicationFixture';
import { ARGAMAN_VE_ZAHAV_THEME } from '~/theme/themes';

import { DedicationBand } from './DedicationBand';

const { colors } = ARGAMAN_VE_ZAHAV_THEME;

// The band's own plum field, `colors.primaryStrong`: presentation glue for
// Storybook only, so the `onPrimary` variant is seen against the field it
// actually sits on rather than the page's `primary`.
const onPrimaryField = (Story: () => ReactNode) => (
  <div style={{ background: colors.primaryStrong }}>
    <Story />
  </div>
);

const meta: Meta<typeof DedicationBand> = {
  title: 'HomePage/DedicationBand',
  component: DedicationBand,
};

export default meta;
type Story = StoryObj<typeof DedicationBand>;

export const OnPrimaryOneUnit: Story = {
  args: { group: DEDICATION_GROUP_SINGLE, hasDedications: true, variant: 'onPrimary' },
  decorators: [onPrimaryField],
};

export const OnPageOneUnit: Story = {
  args: { group: DEDICATION_GROUP_SINGLE, hasDedications: true, variant: 'onPage' },
};

// Static, no self-advance: the group's own width fits the container.
export const FitsNoCrawl: Story = {
  args: { group: DEDICATION_GROUP_HEALING, hasDedications: true, variant: 'onPage' },
};

// Wider than the container: crawls.
export const OverflowsAndCrawls: Story = {
  args: { group: DEDICATION_GROUP_OVERFLOWING, hasDedications: true, variant: 'onPage' },
};

export const OnPrimaryOverflowing: Story = {
  args: { group: DEDICATION_GROUP_OVERFLOWING, hasDedications: true, variant: 'onPrimary' },
  decorators: [onPrimaryField],
};

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const originalMatchMedia = window.matchMedia;

// Patched in `beforeEach`, which runs before the story's tree mounts at
// all, never inside a decorator's own `useEffect`: child effects run
// before a parent decorator's in the same commit, so a decorator-side patch
// lands only after `useDedicationCrawl`'s media-query effect already read
// the real, unreduced value, and that effect never reads it again (B4).
export const ReducedMotionStaysScrollable: Story = {
  args: { group: DEDICATION_GROUP_OVERFLOWING, hasDedications: true, variant: 'onPage' },
  beforeEach: () => {
    window.matchMedia = ((query: string) =>
      originalMatchMedia.call(window, query === REDUCED_MOTION_QUERY ? 'all' : query)) as typeof window.matchMedia;
    return () => {
      window.matchMedia = originalMatchMedia;
    };
  },
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>('.viewport');
    if (!viewport) throw new Error('DedicationBand story: .viewport not found');

    // Stays scrollable: the overflowing group still measures as
    // overflowing under reduced motion (design-system.md, dedication
    // interaction rule 6).
    await waitFor(() => expect(getComputedStyle(viewport).overflowX).toEqual('auto'));

    // Never self-advances: `scrollLeft` does not drift on its own while
    // reduced motion is forced, which the frame loop would otherwise do
    // within a couple of animation frames.
    const restingScrollLeft = viewport.scrollLeft;
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    expect(viewport.scrollLeft).toEqual(restingScrollLeft);
  },
};

// Renders nothing at all: the pool is genuinely empty, not merely
// undrawn. `dedications: []` is a normal 200, never a 404
// (design-system.md, dedication States).
export const NoDedicationsRendersNothing: Story = {
  args: { group: undefined, hasDedications: false, variant: 'onPage' },
};

// The instrument for B1 and B6: mounts exactly the way `HomePage` does,
// with a pool known (`hasDedications`) before its own draw has picked a
// group, then supplies the group a moment later through a state update on
// the same element, never a remount. Before the fix this left the band
// permanently un-measured (B1: the crawl hook's mount-time effect ran
// once, against a still-empty band, and never ran again once real markup
// arrived), so the assertion below is the one that would have failed on
// the original code.
const PendingThenDrawn = ({ group }: { group: DedicationGroup }): ReactNode => {
  const [drawn, setDrawn] = useState<DedicationGroup | undefined>(undefined);
  useEffect(() => {
    setDrawn(group);
  }, [group]);
  return <DedicationBand {...{ group: drawn, hasDedications: true, variant: 'onPage' as const }} />;
};

export const PendingThenDrawnCrawls: Story = {
  render: () => <PendingThenDrawn group={DEDICATION_GROUP_OVERFLOWING} />,
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const viewport = canvasElement.querySelector<HTMLElement>('.viewport');
      if (!viewport) throw new Error('DedicationBand story: .viewport not found once the group lands');
      expect(getComputedStyle(viewport).overflowX).toEqual('auto');
    });
  },
};
