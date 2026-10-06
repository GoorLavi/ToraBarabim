import type { Meta, StoryObj } from '@storybook/react-vite';
import styled from 'styled-components';
import { expect, fn, waitFor, within } from 'storybook/test';

import { stubStandaloneDisplay } from '~/storyMocks';

import { PULL_THRESHOLD_PX } from './consts';
import { PullToRefresh } from './PullToRefresh';

// A page tall enough to scroll, with a text field and a horizontal rail, the
// two things a pull must not trample.
const Page = styled.main`
  min-block-size: 2000px;
  padding: 24px;

  > .scrollBox {
    block-size: 80px;
    overflow-y: auto;

    > .tall {
      block-size: 400px;
    }
  }

  > .rail {
    overflow-x: auto;

    > .track {
      inline-size: 1200px;
      block-size: 80px;
    }
  }
`;

const meta: Meta<typeof PullToRefresh> = {
  title: 'Layout/PullToRefresh',
  component: PullToRefresh,
  parameters: { layout: 'fullscreen' },
  args: { onRefresh: fn() },
  render: (args) => (
    <>
      <Page>
        <input type="text" aria-label="שדה חיפוש" />
        <div className="scrollBox" data-testid="scroll-box">
          <div className="tall">תוכן נגלל</div>
        </div>
        <div className="rail">
          <div className="track">רצועה</div>
        </div>
        <p>תוכן העמוד</p>
      </Page>
      <PullToRefresh {...args} />
    </>
  ),
};

export default meta;
type Story = StoryObj<typeof PullToRefresh>;

// The installed app is the only place this exists, so a story is standalone
// unless it says otherwise.
const standalone: Pick<Story, 'beforeEach'> = { beforeEach: () => stubStandaloneDisplay() };

const FINGER_TRAVEL_FOR_READY_PX = 160;
const FINGER_TRAVEL_SHORT_PX = 60;

const touchPoint = (target: EventTarget, clientX: number, clientY: number): Touch =>
  new Touch({ identifier: 1, target, clientX, clientY });

const fireTouch = (type: 'touchstart' | 'touchmove' | 'touchend', target: HTMLElement, clientX: number, clientY: number): TouchEvent => {
  const touch = touchPoint(target, clientX, clientY);
  const event = new TouchEvent(type, {
    touches: type === 'touchend' ? [] : [touch],
    changedTouches: [touch],
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
};

const fireTwoTouches = (type: 'touchstart' | 'touchmove', target: HTMLElement, first: [number, number], second: [number, number]): TouchEvent => {
  const touches = [touchPoint(target, first[0], first[1]), new Touch({ identifier: 2, target, clientX: second[0], clientY: second[1] })];
  const event = new TouchEvent(type, { touches, changedTouches: touches, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
};

const START_X = 200;
const START_Y = 120;

const dragDown = (target: HTMLElement, fingerTravel: number): TouchEvent => {
  fireTouch('touchstart', target, START_X, START_Y);
  // A first small step classifies the gesture, the second carries it the distance.
  fireTouch('touchmove', target, START_X, START_Y + 20);
  return fireTouch('touchmove', target, START_X, START_Y + fingerTravel);
};

// The indicator is the live region's parent; `null` when nothing is mounted.
const indicator = (): HTMLElement | null => document.querySelector<HTMLElement>('[role="status"]')?.parentElement ?? null;

const pullDistance = (): number => parseFloat(indicator()?.style.getPropertyValue('--pull-distance') || '0');

const pageText = (canvasElement: HTMLElement): HTMLElement => within(canvasElement).getByText('תוכן העמוד');

// Held mid-pull, finger still down: the spinner follows it and is not ready.
export const PullingHeldShortOfTheThreshold: Story = {
  ...standalone,
  play: async ({ canvasElement }) => {
    const move = dragDown(pageText(canvasElement), FINGER_TRAVEL_SHORT_PX);

    await waitFor(() => expect(indicator()).toHaveClass('pulling'));
    await expect(pullDistance()).toBeGreaterThan(0);
    await expect(pullDistance()).toBeLessThan(PULL_THRESHOLD_PX);
    // Never blocks the browser's own scrolling: the bounce is off in the
    // global style instead.
    await expect(move.defaultPrevented).toBe(false);
  },
};

// Held past the threshold, finger still down: the ready state.
export const ReadyHeldPastTheThreshold: Story = {
  ...standalone,
  play: async ({ canvasElement }) => {
    dragDown(pageText(canvasElement), FINGER_TRAVEL_FOR_READY_PX);

    await waitFor(() => expect(indicator()).toHaveClass('ready'));
    await expect(await within(document.body).findByText('שחררו כדי לרענן')).toBeInTheDocument();
  },
};

// Released short of the threshold: springs back, no refresh.
export const ReleaseShortSpringsBack: Story = {
  ...standalone,
  play: async ({ canvasElement, args }) => {
    const target = pageText(canvasElement);
    dragDown(target, FINGER_TRAVEL_SHORT_PX);
    fireTouch('touchend', target, START_X, START_Y + FINGER_TRAVEL_SHORT_PX);

    await waitFor(() => expect(indicator()).toHaveClass('idle'));
    await expect(pullDistance()).toBe(0);
    await expect(args.onRefresh).not.toHaveBeenCalled();
  },
};

// Released past the threshold: the refresh runs and the spinner keeps turning.
export const ReleasePastTheThresholdRefreshes: Story = {
  ...standalone,
  play: async ({ canvasElement, args }) => {
    const target = pageText(canvasElement);
    dragDown(target, FINGER_TRAVEL_FOR_READY_PX);
    fireTouch('touchend', target, START_X, START_Y + FINGER_TRAVEL_FOR_READY_PX);

    await waitFor(() => expect(args.onRefresh).toHaveBeenCalledTimes(1));
    await expect(indicator()).toHaveClass('refreshing');
    await expect(await within(document.body).findByText('העמוד מתרענן')).toBeInTheDocument();
  },
};

// A browser tab has its own pull-to-refresh and its own address bar.
export const IgnoredWhenNotStandalone: Story = {
  play: async ({ canvasElement, args }) => {
    const target = pageText(canvasElement);
    const move = dragDown(target, FINGER_TRAVEL_FOR_READY_PX);
    fireTouch('touchend', target, START_X, START_Y + FINGER_TRAVEL_FOR_READY_PX);

    await expect(indicator()).toBeNull();
    await expect(move.defaultPrevented).toBe(false);
    await expect(args.onRefresh).not.toHaveBeenCalled();
  },
};

// A person typing is not asking to refresh.
export const IgnoredWhileATextFieldHasFocus: Story = {
  ...standalone,
  play: async ({ canvasElement, args }) => {
    within(canvasElement).getByRole('textbox', { name: 'שדה חיפוש' }).focus();
    const target = pageText(canvasElement);
    const move = dragDown(target, FINGER_TRAVEL_FOR_READY_PX);
    fireTouch('touchend', target, START_X, START_Y + FINGER_TRAVEL_FOR_READY_PX);

    await expect(indicator()).toHaveClass('idle');
    await expect(move.defaultPrevented).toBe(false);
    await expect(args.onRefresh).not.toHaveBeenCalled();
  },
};

// A swipe along a rail is horizontal: it locks out before it can become a pull.
export const IgnoredOnAHorizontalSwipe: Story = {
  ...standalone,
  play: async ({ canvasElement, args }) => {
    const rail = within(canvasElement).getByText('רצועה');
    fireTouch('touchstart', rail, START_X, START_Y);
    fireTouch('touchmove', rail, START_X - 40, START_Y + 6);
    const move = fireTouch('touchmove', rail, START_X - 80, START_Y + 200);
    fireTouch('touchend', rail, START_X - 80, START_Y + 200);

    await expect(indicator()).toHaveClass('idle');
    await expect(move.defaultPrevented).toBe(false);
    await expect(args.onRefresh).not.toHaveBeenCalled();
  },
};

// Only at the very top: a page scrolled down just scrolls back up.
export const IgnoredWhenThePageIsScrolled: Story = {
  beforeEach: () => {
    const restoreDisplay = stubStandaloneDisplay();
    return () => {
      window.scrollTo(0, 0);
      restoreDisplay();
    };
  },
  play: async ({ canvasElement, args }) => {
    window.scrollTo(0, 300);
    await waitFor(() => expect(window.scrollY).toBeGreaterThan(0));

    const target = pageText(canvasElement);
    const move = dragDown(target, FINGER_TRAVEL_FOR_READY_PX);
    fireTouch('touchend', target, START_X, START_Y + FINGER_TRAVEL_FOR_READY_PX);

    await expect(indicator()).toHaveClass('idle');
    await expect(move.defaultPrevented).toBe(false);
    await expect(args.onRefresh).not.toHaveBeenCalled();
  },
};

// A pull that turns back above where it started is a scroll: the gesture is
// dropped, nothing is blocked, the indicator goes back to idle.
export const DroppedWhenThePullTurnsIntoAnUpwardScroll: Story = {
  ...standalone,
  play: async ({ canvasElement, args }) => {
    const target = pageText(canvasElement);
    dragDown(target, FINGER_TRAVEL_SHORT_PX);
    await waitFor(() => expect(indicator()).toHaveClass('pulling'));

    const move = fireTouch('touchmove', target, START_X, START_Y - 30);
    fireTouch('touchend', target, START_X, START_Y - 30);

    await expect(move.defaultPrevented).toBe(false);
    await waitFor(() => expect(indicator()).toHaveClass('idle'));
    await expect(pullDistance()).toBe(0);
    await expect(args.onRefresh).not.toHaveBeenCalled();
  },
};

// A second finger mid-pull (a pinch) ends the pull and clears the indicator.
export const DroppedWhenASecondFingerLandsMidPull: Story = {
  ...standalone,
  play: async ({ canvasElement, args }) => {
    const target = pageText(canvasElement);
    dragDown(target, FINGER_TRAVEL_FOR_READY_PX);
    await waitFor(() => expect(indicator()).toHaveClass('ready'));

    fireTwoTouches('touchstart', target, [START_X, START_Y + FINGER_TRAVEL_FOR_READY_PX], [100, 300]);
    fireTouch('touchend', target, START_X, START_Y + FINGER_TRAVEL_FOR_READY_PX);

    await waitFor(() => expect(indicator()).toHaveClass('idle'));
    await expect(pullDistance()).toBe(0);
    await expect(args.onRefresh).not.toHaveBeenCalled();
  },
};

// A second finger arriving on a move, not a start, clears it the same way.
export const DroppedWhenAMoveCarriesTwoFingers: Story = {
  ...standalone,
  play: async ({ canvasElement }) => {
    const target = pageText(canvasElement);
    dragDown(target, FINGER_TRAVEL_SHORT_PX);
    await waitFor(() => expect(indicator()).toHaveClass('pulling'));

    fireTwoTouches('touchmove', target, [START_X, START_Y + FINGER_TRAVEL_SHORT_PX], [100, 300]);

    await waitFor(() => expect(indicator()).toHaveClass('idle'));
    await expect(pullDistance()).toBe(0);
  },
};

// A box that is itself scrolled owns the drag: the pull never starts inside it.
export const IgnoredInsideAScrolledBox: Story = {
  ...standalone,
  play: async ({ canvasElement, args }) => {
    const box = within(canvasElement).getByTestId('scroll-box');
    box.scrollTop = 40;
    await waitFor(() => expect(box.scrollTop).toBeGreaterThan(0));

    const inside = within(box).getByText('תוכן נגלל');
    const move = dragDown(inside, FINGER_TRAVEL_FOR_READY_PX);
    fireTouch('touchend', inside, START_X, START_Y + FINGER_TRAVEL_FOR_READY_PX);

    await waitFor(() => expect(indicator()).toHaveClass('idle'));
    await expect(move.defaultPrevented).toBe(false);
    await expect(args.onRefresh).not.toHaveBeenCalled();
  },
};
