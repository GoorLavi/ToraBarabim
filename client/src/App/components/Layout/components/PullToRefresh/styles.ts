import { css, keyframes } from 'styled-components';

import {
  DISTANCE_PROPERTY,
  INDICATOR_SIZE_PX,
  PROGRESS_PROPERTY,
  PULL_OPACITY_RAMP,
  PULL_ROTATION_DEG,
  REFRESHING_ARC_GAP_SHARE,
  RING_CIRCUMFERENCE,
  RING_STROKE_WIDTH,
  SPIN_DURATION_MS,
  SPRING_BACK_MS,
} from './consts';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// The indicator is parked above the top edge and slid down by the pull
// distance, which the hook writes as a CSS variable straight from the touch
// handler (usePullToRefresh.ts), so a drag never re-renders React. It sits
// below the top safe-area inset. A keyframes helper needs the tagged css form,
// so this block is the one in the app written that way.
export const PullToRefresh = css(
  ({ theme }) => css`
  ${DISTANCE_PROPERTY}: 0px;
  ${PROGRESS_PROPERTY}: 0;

  position: fixed;
  inset-inline: 0;
  inset-block-start: env(safe-area-inset-top, 0px);
  z-index: ${theme.zIndex.floatingSheet};
  display: flex;
  justify-content: center;
  pointer-events: none;
  transform: translateY(calc(var(${DISTANCE_PROPERTY}) - ${theme.spacing.xl}));
  opacity: clamp(0, calc(var(${PROGRESS_PROPERTY}) * ${PULL_OPACITY_RAMP}), 1);
  transition: transform ${SPRING_BACK_MS}ms ease-out, opacity ${SPRING_BACK_MS}ms ease-out;

  /* While the finger is down the indicator follows it with no easing. */
  &.pulling,
  &.ready {
    transition: none;
  }

  > .spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    inline-size: ${INDICATOR_SIZE_PX}px;
    block-size: ${INDICATOR_SIZE_PX}px;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.pill};
    background: ${theme.colors.surface};
    box-shadow: ${theme.shadows.raised};
    color: ${theme.colors.textSecondary};

    > .ring {
      transform: rotate(calc(var(${PROGRESS_PROPERTY}) * ${PULL_ROTATION_DEG}deg));

      > .track {
        stroke: ${theme.colors.border};
        stroke-width: ${RING_STROKE_WIDTH};
      }

      > .arc {
        stroke: currentColor;
        stroke-width: ${RING_STROKE_WIDTH};
        stroke-linecap: round;
        stroke-dasharray: ${RING_CIRCUMFERENCE};
        stroke-dashoffset: calc(${RING_CIRCUMFERENCE} * (1 - var(${PROGRESS_PROPERTY})));
        transform: rotate(-90deg);
        transform-origin: center;
      }
    }
  }

  &.ready > .spinner,
  &.refreshing > .spinner {
    color: ${theme.colors.primary};
  }

  &.refreshing > .spinner > .ring {
    animation: ${spin} ${SPIN_DURATION_MS}ms linear infinite;

    > .arc {
      stroke-dashoffset: ${RING_CIRCUMFERENCE * REFRESHING_ARC_GAP_SHARE};
    }
  }

  /* Read aloud, never drawn. */
  > .statusText {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &.refreshing > .spinner > .ring {
      animation: none;
    }
  }
`,
);
