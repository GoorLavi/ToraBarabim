import type { Meta, StoryObj } from '@storybook/react-vite';
import { cdp } from 'vitest/browser';
import type { ReactElement, ReactNode } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';

import { DEDICATION_UNIT_WIDTH_PX } from '~/components/DedicationUnit/consts';
import {
  DEDICATION_GROUP_HEALING,
  DEDICATION_GROUP_MEMORIAL,
  DEDICATION_GROUP_OVERFLOWING,
  DEDICATION_GROUP_SINGLE,
  DEDICATION_GROUP_SUCCESS,
} from '~/dedicationFixture';
import { ARGAMAN_VE_ZAHAV_THEME } from '~/theme/themes';

import { DEDICATION_UNIT_GAP_PX, RESUME_AFTER_INTERACTION_MS } from './consts';
import { DedicationBand } from './DedicationBand';
import { wrapTrackPosition } from './helpers';

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

// A pool this short is also the instrument for centring (owner, on the
// real site, in both variants: "גם בלבן"): a track narrower than its
// container centres instead of sitting flush to the inline start with a
// gap left in the middle of the band.
const expectCenteredViewport = ({ canvasElement }: { canvasElement: HTMLElement }): void => {
  const viewport = canvasElement.querySelector<HTMLElement>('.viewport');
  if (!viewport) throw new Error('DedicationBand story: .viewport not found');
  expect(getComputedStyle(viewport).justifyContent).toEqual('center');
};

export const OnPrimaryOneUnit: Story = {
  args: { group: DEDICATION_GROUP_SINGLE, variant: 'onPrimary' },
  decorators: [onPrimaryField],
  play: expectCenteredViewport,
};

export const OnPageOneUnit: Story = {
  args: { group: DEDICATION_GROUP_SINGLE, variant: 'onPage' },
  play: expectCenteredViewport,
};

// The three fixed placements (HomePage.tsx), one band per type: `success`
// between the rails, `healing` between the rails block and `RabbiRow`,
// both `onPage`, and `memorial` at the foot, `onPrimary`.
export const SuccessBand: Story = {
  args: { group: DEDICATION_GROUP_SUCCESS, variant: 'onPage' },
};

export const HealingBand: Story = {
  args: { group: DEDICATION_GROUP_HEALING, variant: 'onPage' },
};

export const MemorialBand: Story = {
  args: { group: DEDICATION_GROUP_MEMORIAL, variant: 'onPrimary' },
  decorators: [onPrimaryField],
};

// Static, no self-advance: the group's own width fits the container.
export const FitsNoCrawl: Story = {
  args: { group: DEDICATION_GROUP_HEALING, variant: 'onPage' },
};

// Wider than the container: crawls.
export const OverflowsAndCrawls: Story = {
  args: { group: DEDICATION_GROUP_OVERFLOWING, variant: 'onPage' },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector('.track.duplicate')).not.toBeNull());

    // Every pair of adjacent units sits exactly DEDICATION_UNIT_GAP_PX
    // apart, including the loop's own seam between the real track's last
    // unit and the duplicate's first: the edge framing used to live on
    // each `.track` and doubled up there instead of matching the 64px
    // every other pair gets (measured: eight gaps of 64 and one of 32).
    // Sorted by physical position, not DOM order, since direction: rtl
    // reverses which edge is which without reversing the document order.
    const rects = Array.from(canvasElement.querySelectorAll<HTMLElement>('.track > *'))
      .map((unit) => unit.getBoundingClientRect())
      .sort((a, b) => a.left - b.left);

    for (let index = 0; index < rects.length - 1; index++) {
      const current = rects[index];
      const next = rects[index + 1];
      if (!current || !next) throw new Error('DedicationBand story: unexpected gap in the sorted rect list');
      const gap = next.left - current.right;
      expect(gap).toBeGreaterThan(DEDICATION_UNIT_GAP_PX - 2);
      expect(gap).toBeLessThan(DEDICATION_UNIT_GAP_PX + 2);
    }
  },
};

// `CRAWL_SPEED_PX_PER_SECOND` is 32, not the 60 (one frame's `scrollLeft`
// rounding to a whole pixel every single frame at 60Hz, regardless of the
// real elapsed time) or 120 (the same rounding at 120Hz) a naive read of
// `scrollLeft` back into the next frame's maths produces. A wide tolerance
// band, not an exact figure: real frame timing jitters, but 32 and 60 are
// far enough apart that this still catches the regression.
export const CrawlsAtTheDesignedSpeed: Story = {
  args: { group: DEDICATION_GROUP_OVERFLOWING, variant: 'onPage' },
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>('.viewport');
    if (!viewport) throw new Error('DedicationBand story: .viewport not found');

    await waitFor(() => expect(getComputedStyle(viewport).overflowX).toEqual('auto'));

    const start = viewport.scrollLeft;
    const startTime = performance.now();
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    const end = viewport.scrollLeft;
    const elapsedSeconds = (performance.now() - startTime) / 1000;

    const speedPxPerSecond = Math.abs(end - start) / elapsedSeconds;
    expect(speedPxPerSecond).toBeGreaterThan(15);
    expect(speedPxPerSecond).toBeLessThan(45);
  },
};

export const OnPrimaryOverflowing: Story = {
  args: { group: DEDICATION_GROUP_OVERFLOWING, variant: 'onPrimary' },
  decorators: [onPrimaryField],
};

// An arrow-key step always lands on a unit boundary, never mid-name (rule
// 5), even though the crawl itself is left at an arbitrary, almost
// certainly fractional position by the time a reader tabs in and presses a
// key. Before the fix, stepping added the pitch to whatever position the
// crawl had frozen at, preserving that same off-grid offset on every press
// instead of correcting it.
export const ArrowKeyAlwaysLandsOnAUnitBoundary: Story = {
  args: { group: DEDICATION_GROUP_OVERFLOWING, variant: 'onPage' },
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>('.viewport');
    if (!viewport) throw new Error('DedicationBand story: .viewport not found');
    await waitFor(() => expect(getComputedStyle(viewport).overflowX).toEqual('auto'));

    // Let the crawl drift to an arbitrary position first, the way it
    // would have by the time a real reader tabs in.
    await new Promise((resolve) => window.setTimeout(resolve, 650));

    viewport.focus();
    await userEvent.keyboard('{ArrowLeft}');

    const pitch = DEDICATION_UNIT_WIDTH_PX + DEDICATION_UNIT_GAP_PX;
    const rtlSign = getComputedStyle(viewport).direction === 'rtl' ? -1 : 1;
    const position = viewport.scrollLeft * rtlSign;
    const offsetFromGridLine = ((position % pitch) + pitch) % pitch;
    const distanceFromNearestGridLine = Math.min(offsetFromGridLine, pitch - offsetFromGridLine);

    expect(distanceFromNearestGridLine).toBeLessThan(1);
  },
};

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const originalMatchMedia = window.matchMedia;

// Patched in `beforeEach`, which runs before the story's tree mounts at
// all, never inside a decorator's own `useEffect`: child effects run
// before a parent decorator's in the same commit, so a decorator-side patch
// lands only after `useDedicationCrawl`'s media-query effect already read
// the real, unreduced value, and that effect never reads it again (B4).
export const ReducedMotionStaysScrollable: Story = {
  args: { group: DEDICATION_GROUP_OVERFLOWING, variant: 'onPage' },
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
  args: { group: undefined, variant: 'onPage' },
};

// Every optional line present (formula, name, parent, closing, donor
// credit), the shape the reservation is built for, and a name short enough
// to never wrap: wrapping was never what the reservation guaranteed (the
// reference it was built from, DEDICATION_BAND_ON_PRIMARY_HEIGHT_REFERENCE,
// is itself a single-line figure), so this fixture isolates the
// reservation's own guarantee from that separate, pre-existing gap.
const RESERVATION_PROOF_TEXT = {
  formulaLine: 'לעילוי נשמת',
  nameLine: 'שרה כהן',
  parentLine: 'בת אברהם',
  closingLine: 'תנצב״ה',
  donorCreditLine: 'תרומת משפחת לוי',
};

// Released by a control the play function itself clicks, never a timer
// (Copilot PR review, PR #73: a delay only lowers the probability of the
// play function starting after the draw already landed, it does not remove
// it, and the story would then fail nondeterministically on a slow run
// with `.pending` already gone). The button is story-only scaffolding, not
// a change to DedicationBand's own DOM: it exists so the story controls
// both sides of the race instead of guessing at one of them with a clock.
const PendingThenDrawnWithSentinel = ({ group }: { group: DedicationGroup }): ReactNode => {
  const [drawn, setDrawn] = useState<DedicationGroup | undefined>(undefined);
  return (
    <div>
      <DedicationBand {...{ group: drawn, hasDedications: true, variant: 'onPrimary' as const }} />
      <p className="sentinel">תוכן מתחת לרצועה</p>
      <button type="button" className="releaseDraw" onClick={() => setDrawn(group)}>
        שחרר ציור
      </button>
    </div>
  );
};

// Copilot PR review, finding 1: the `.pending` reservation used to be
// `scaledCss` applied to the band as one value, which understated the real
// height by about 40px, because formula, name and parent were already
// clamped to their own floors at this scale while padding and the ornament
// were not (helpers.ts, dedicationBandReservedHeightPx). Proven the way the
// guarantee is actually meant to be read: something below the band, whose
// own position must not move once the real draw lands.
export const PendingReservationMatchesTheDraw: Story = {
  render: () => (
    <PendingThenDrawnWithSentinel group={{ type: 'memorial', items: [{ id: 'dedication-reservation-proof', text: RESERVATION_PROOF_TEXT }] }} />
  ),
  play: async ({ canvasElement }) => {
    const pending = canvasElement.querySelector<HTMLElement>('.pending');
    if (!pending) throw new Error('DedicationBand story: .pending band not found before the draw');
    const sentinel = canvasElement.querySelector<HTMLElement>('.sentinel');
    if (!sentinel) throw new Error('DedicationBand story: .sentinel not found');
    const releaseDraw = canvasElement.querySelector<HTMLButtonElement>('.releaseDraw');
    if (!releaseDraw) throw new Error('DedicationBand story: .releaseDraw control not found');

    const topBeforeDraw = sentinel.getBoundingClientRect().top;

    await userEvent.click(releaseDraw);

    await waitFor(() => {
      const track = canvasElement.querySelector('.track');
      if (!track) throw new Error('DedicationBand story: .track not found once the group lands');
    });

    const topAfterDraw = sentinel.getBoundingClientRect().top;

    // A pixel or two, not zero: font rasterisation and subpixel layout will
    // not reproduce to the hundredth across environments, and an exact
    // equality here would fail in CI for that reason alone (Copilot PR
    // review, finding 2's own warning, applied to this assertion too). What
    // this guards against is a reservation short by tens of pixels, the
    // actual defect found, so a tolerance two orders of magnitude below
    // that still catches it.
    expect(Math.abs(topAfterDraw - topBeforeDraw)).toBeLessThan(2);
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
  args: { group: DEDICATION_GROUP_OVERFLOWING, variant: 'onPage' },
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
// a blur to end the pause. Driven through `cdp()`, not `userEvent.click`:
// measured directly, `userEvent`'s own click, even under this runner's real
// browser automation, leaves `:focus-visible` true, which is not what a
// genuine mouse click leaves it at, and would make this story pass whether
// the bug were fixed or not.
const dispatchRealMouseClick = async (x: number, y: number): Promise<void> => {
  const client = cdp();
  await client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
};

export const MouseClickDoesNotFreezeTheCrawl: Story = {
  args: { group: DEDICATION_GROUP_OVERFLOWING, variant: 'onPage' },
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>('.viewport');
    if (!viewport) throw new Error('DedicationBand story: .viewport not found');

    await waitFor(() => expect(getComputedStyle(viewport).overflowX).toEqual('auto'));

    const box = viewport.getBoundingClientRect();
    // The click itself is also a pointer down-then-up on the viewport,
    // which starts the same `RESUME_AFTER_INTERACTION_MS` cooldown a drag
    // does: both the buggy and the fixed code stay frozen for that
    // stretch, so the comparison below has to sit entirely past it, or it
    // would pass on the buggy code too, for the wrong reason. Measured
    // with the pointer moved away afterward, same as the finding: hovering
    // is its own, correct, separate pause (rule 2), so leaving the pointer
    // sitting on the band would freeze it for a real reason and prove
    // nothing about the focus bug.
    await dispatchRealMouseClick(box.left + box.width / 2, box.top + box.height / 2);
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 5 });
    await new Promise((resolve) => window.setTimeout(resolve, RESUME_AFTER_INTERACTION_MS + 500));
    const afterCooldown = viewport.scrollLeft;

    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    const later = viewport.scrollLeft;

    expect(later).not.toEqual(afterCooldown);
  },
};

// Mixed real data, the shape that showed this on the owner's own
// screenshot: one unit carries a parent line and a donor credit, one
// carries neither. Every lower ornament's own bottom edge lines up
// regardless (measured before the fix: 1693.3, 1609.3, 1693.3, an 84px
// spread, the shorter unit closing its ornament early into a hole in the
// row it is meant to frame).
export const OrnamentsShareABaselineWithMixedContent: Story = {
  args: { group: DEDICATION_GROUP_MEMORIAL, variant: 'onPage' },
  play: async ({ canvasElement }) => {
    const lowerOrnaments = Array.from(canvasElement.querySelectorAll<SVGElement>('.track:not(.duplicate) > * > .mirrored'));
    expect(lowerOrnaments.length).toBeGreaterThan(1);

    const bottoms = lowerOrnaments.map((ornament) => ornament.getBoundingClientRect().bottom);
    const [firstBottom] = bottoms;
    if (firstBottom === undefined) throw new Error('DedicationBand story: no lower ornaments found');
    for (const bottom of bottoms) {
      expect(Math.abs(bottom - firstBottom)).toBeLessThan(1);
    }
  },
};

// This is a drag surface: without user-select: none, a drag starting on a
// name selects the text instead of moving the band (owner, on a real
// phone). Driven through cdp(), not userEvent: whether a mouse drag starts
// a native text selection is the browser's own gesture recognition, the
// same class of behaviour the touch and click stories above needed a real
// input for, not something a synthetic DOM event reliably exercises.
export const DragDoesNotSelectText: Story = {
  args: { group: DEDICATION_GROUP_OVERFLOWING, variant: 'onPage' },
  play: async ({ canvasElement }) => {
    const name = canvasElement.querySelector<HTMLElement>('.name');
    if (!name) throw new Error('DedicationBand story: .name not found');

    const box = name.getBoundingClientRect();
    const y = box.top + box.height / 2;
    const startX = box.left + 4;
    const endX = box.right - 4;

    const client = cdp();
    await client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: startX, y });
    await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: startX, y, button: 'left', clickCount: 1 });
    const steps = 6;
    for (let step = 1; step <= steps; step++) {
      const x = startX + ((endX - startX) * step) / steps;
      await client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, buttons: 1 });
      await new Promise((resolve) => window.setTimeout(resolve, 16));
    }
    await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: endX, y, button: 'left', clickCount: 1 });

    const selection = window.getSelection();
    expect(selection?.toString() ?? '').toEqual('');
    expect(selection?.rangeCount ?? 0).toEqual(0);
  },
};

// The scale is now a fixed value per breakpoint, selected by viewport
// width alone (DedicationBand/styles.ts, DedicationBand/consts.ts:
// DEDICATION_SCALE_BELOW_MD / DEDICATION_SCALE_FROM_MD), not a function of
// viewport height the way the superseded 100svh-driven version was. Both
// variants, and a group that carries both a wrapped name and a short unit
// (no parent, no donor) in the same drawn group, since a name that wraps
// and a unit missing two lines are the two shapes most likely to expose a
// height regression the single-line fixtures above would not.
const widthComparison = (): ReactElement => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
    <div style={{ background: colors.primaryStrong }}>
      <DedicationBand {...{ group: DEDICATION_GROUP_MEMORIAL, variant: 'onPrimary' as const }} />
    </div>
    <DedicationBand {...{ group: DEDICATION_GROUP_MEMORIAL, variant: 'onPage' as const }} />
  </div>
);

// This story renders inside its own iframe (the runner's test harness),
// which has its own independent viewport width: the top-level page's own
// size, which `cdp()`'s device metrics would change, is not it.
// `window.frameElement` (reachable same-origin) is the iframe element
// itself, seen from inside it, so resizing that directly is what actually
// crosses the md breakpoint this story means to test.
//
// Asserted against the heights actually measured (375: onPrimary 205.4,
// onPage 196.1; 1280: onPrimary 209.1, onPage 197.5), not the owner's own
// target: the individual floors on formula, name, parent, closing and
// donor already sit above what either target asks for
// (DedicationBand/consts.ts), so the real height lands close to that
// floor-composed minimum rather than to 165 or 180.
//
// A tolerance, not an exact equality: font rasterisation and subpixel
// layout will not reproduce to the hundredth across environments, and an
// assertion that fails in CI for that reason teaches people to loosen
// assertions rather than fix the real regression. Two pixels, the same
// figure chosen for the reservation proof above, for the same reason: wide
// enough to absorb that noise, narrow enough that nudging a floor by even a
// couple of pixels still fails it.
const HEIGHT_ASSERTION_TOLERANCE_PX = 2;

const expectHeightNear = (actualPx: number, expectedPx: number): void => {
  expect(Math.abs(actualPx - expectedPx)).toBeLessThan(HEIGHT_ASSERTION_TOLERANCE_PX);
};

const measureBandHeightsAtWidth = (widthPx: number, expectedOnPrimaryPx: number, expectedOnPagePx: number) => async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}): Promise<void> => {
  const frame = window.frameElement as HTMLIFrameElement | null;
  if (!frame) throw new Error('DedicationBand story: window.frameElement not found, expected to be running inside the test runner\'s iframe');

  const originalWidth = frame.style.width;
  frame.style.width = `${widthPx}px`;
  try {
    await new Promise((resolve) => window.setTimeout(resolve, 100));
    const onPrimaryBand = canvasElement.querySelector<HTMLElement>('.onPrimary');
    const onPageBand = canvasElement.querySelector<HTMLElement>('.onPage');
    if (!onPrimaryBand) throw new Error('DedicationBand story: .onPrimary band not found');
    if (!onPageBand) throw new Error('DedicationBand story: .onPage band not found');

    const onPrimaryHeight = onPrimaryBand.getBoundingClientRect().height;
    const onPageHeight = onPageBand.getBoundingClientRect().height;

    expectHeightNear(onPrimaryHeight, expectedOnPrimaryPx);
    expectHeightNear(onPageHeight, expectedOnPagePx);
  } finally {
    frame.style.width = originalWidth;
  }
};

export const WidthPhone: Story = {
  render: widthComparison,
  play: measureBandHeightsAtWidth(375, 205.4, 196.1),
};

export const WidthDesktop: Story = {
  render: widthComparison,
  play: measureBandHeightsAtWidth(1280, 209.1, 197.5),
};

// wrapTrackPosition has to bring a position several periods out of range
// back in, not only one period out: a resumed tab's first frame used to
// deliver a huge real delta (now capped, useDedicationCrawl.ts), and a
// single subtract-or-add only corrected a position that was already
// within two periods of the origin. Exercised directly against the pure
// function, since this is a defect in its own arithmetic, not something a
// DOM interaction would isolate. No render-dependent assertion, so the
// args here are only enough to satisfy the story's own required props.
export const WrapTrackPositionHandlesMultiplePeriods: Story = {
  args: { group: DEDICATION_GROUP_SINGLE, variant: 'onPage' },
  play: () => {
    const period = 344;

    expect(wrapTrackPosition(period * 3.5, period)).toEqual(period * 0.5);
    expect(wrapTrackPosition(-period * 2.5, period)).toEqual(period * 0.5);

    // The seam round-trip still holds: advancing past the seam and
    // stepping back across it land on the same position, in both
    // directions.
    expect(wrapTrackPosition(period + 10, period)).toEqual(10);
    expect(wrapTrackPosition(-10, period)).toEqual(period - 10);
  },
};
