import type { DedicationGroup } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { cdp } from 'vitest/browser';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';

import { DEDICATION_GROUP_HEALING, DEDICATION_GROUP_OVERFLOWING, DEDICATION_GROUP_SINGLE } from '~/dedicationFixture';
import { ARGAMAN_VE_ZAHAV_THEME } from '~/theme/themes';

import { RESUME_AFTER_INTERACTION_MS } from './consts';
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

// One real touch gesture, through Chrome DevTools Protocol via `cdp()`,
// stepped over several `touchmove` points the way a finger actually moves.
// A synthetic DOM `TouchEvent` cannot stand in for this: whether a swipe
// scrolls the page or the element it started on is decided by the
// browser's own gesture recognition against `touch-action`, upstream of
// any application code, so nothing short of a real touch input exercises
// it. This is the one that was wrong in the most damaging way: `touch-action:
// pan-x` was added believing it protected the page's own vertical scroll,
// and was instead measured, on a real device, to trap it (an on-band swipe
// moved the page 0px; the identical swipe just above the band moved it
// normally). Without this assertion the next reader has only the comment
// in styles.ts to go on.
const dispatchVerticalTouchSwipe = async (x: number, startY: number, distancePx: number): Promise<void> => {
  const client = cdp();
  const steps = 8;
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: startY }] });
  for (let step = 1; step <= steps; step++) {
    const y = startY - (distancePx * step) / steps;
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
    await new Promise((resolve) => window.setTimeout(resolve, 16));
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
};

export const VerticalSwipeScrollsThePage: Story = {
  args: { group: DEDICATION_GROUP_OVERFLOWING, hasDedications: true, variant: 'onPage' },
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>('.viewport');
    if (!viewport) throw new Error('DedicationBand story: .viewport not found');

    // The story alone is exactly the band's own height: without something
    // taller than the viewport to scroll past, no swipe, trapped or not,
    // would move anything, and the assertion below would pass for the
    // wrong reason.
    const filler = document.createElement('div');
    filler.style.blockSize = '2000px';
    document.body.appendChild(filler);
    window.scrollTo(0, 0);
    await new Promise((resolve) => window.setTimeout(resolve, 50));

    try {
      const box = viewport.getBoundingClientRect();
      const restingScrollY = window.scrollY;

      await dispatchVerticalTouchSwipe(box.left + box.width / 2, box.top + box.height / 2, 200);
      await new Promise((resolve) => window.setTimeout(resolve, 200));

      expect(Math.abs(window.scrollY - restingScrollY)).toBeGreaterThan(50);
    } finally {
      document.body.removeChild(filler);
      window.scrollTo(0, 0);
    }
  },
};

// The one that survived code review, because it is mouse-only: a mousedown
// focuses the viewport (it is `tabIndex={0}` for arrow-key stepping), and
// the crawl used to pause on any focus, keyboard or not, with nothing but
// a blur to end the pause. `userEvent.click` is a real mouse interaction
// under this runner's own browser automation, so `:focus-visible` on the
// result matches what a real mouse click leaves it at.
export const MouseClickDoesNotFreezeTheCrawl: Story = {
  args: { group: DEDICATION_GROUP_OVERFLOWING, hasDedications: true, variant: 'onPage' },
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>('.viewport');
    if (!viewport) throw new Error('DedicationBand story: .viewport not found');

    await waitFor(() => expect(getComputedStyle(viewport).overflowX).toEqual('auto'));

    // The click itself, real or synthetic, is also a pointer down-then-up
    // on the viewport, which starts the same `RESUME_AFTER_INTERACTION_MS`
    // cooldown a drag does: both the buggy and the fixed code stay frozen
    // for that stretch, so the comparison below has to sit entirely past
    // it, or it would pass on the buggy code too, for the wrong reason.
    // Measured with the pointer moved away afterward, same as the finding:
    // hovering is its own, correct, separate pause (rule 2), so leaving the
    // pointer sitting on the band would freeze it for a real reason and
    // prove nothing about the focus bug.
    await userEvent.click(viewport);
    console.log('DEBUG activeElement===viewport', document.activeElement === viewport, 'focus-visible', viewport.matches(':focus-visible'));
    await userEvent.unhover(viewport);
    await new Promise((resolve) => window.setTimeout(resolve, RESUME_AFTER_INTERACTION_MS + 500));
    const afterCooldown = viewport.scrollLeft;
    console.log('DEBUG afterCooldown', afterCooldown, 'activeElement===viewport', document.activeElement === viewport);

    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    const later = viewport.scrollLeft;
    console.log('DEBUG later', later);

    expect(later).not.toEqual(afterCooldown);
  },
};
