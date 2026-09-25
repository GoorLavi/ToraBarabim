import { css } from 'styled-components';
import type { DefaultTheme } from 'styled-components';

// Shared by the phone stage's own overlay and the desktop frame's own
// overlay (styles below): the 48px prev and next arrows and the counter,
// positioned the same way against whichever `position: relative` box they
// sit in.
const arrowAndCounterFragment = (theme: DefaultTheme): string => `
  > .arrow {
    position: absolute;
    inset-block-start: 50%;
    transform: translateY(-50%);
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    inline-size: 48px;
    block-size: 48px;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.pill};
    background: ${theme.colors.surface};
    color: ${theme.colors.primary};
    box-shadow: ${theme.shadows.raised};

    &:disabled {
      opacity: 0.4;
    }

    > svg {
      inline-size: 20px;
      block-size: 20px;
    }

    &.prev {
      inset-inline-start: ${theme.spacing.sm};
    }

    &.next {
      inset-inline-end: ${theme.spacing.sm};
    }
  }

  > .counter {
    position: absolute;
    inset-block-end: ${theme.spacing.sm};
    inset-inline-end: ${theme.spacing.sm};
    padding-block: ${theme.spacing.xs};
    padding-inline: ${theme.spacing.sm};
    border: 1px solid ${theme.colors.accentOnDark};
    border-radius: ${theme.radii.sm};
    background: ${theme.colors.primary};
    color: ${theme.colors.textOnPrimary};
    font-weight: ${theme.typography.tagAndCaption.fontWeight};
    font-size: ${theme.typography.tagAndCaption.phone.fontSize};
    line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
  }
`;

// Below `lg`: the full-bleed, swipeable strip of every photo is the
// browsing surface, its own 48px arrows and counter overlaid on the strip
// itself (design gate round 3 finding: a second, desktop frame stacked
// underneath it had doubled every photo). Each slide the viewport width
// less 48px so the next one peeks at the inline end, the same bleed
// technique as `HomePage/components/RabbiRow/styles.ts`'s own `.row`. The
// 56px thumbnail strip stays visible too, scrolling the phone strip to
// whichever one is tapped (CourseGallery.tsx, `goTo`). From `lg` up
// (design brief A, item 7): the desktop frame-plus-thumbnails pair, the
// phone stage hidden (the frame is the browsing surface there instead).
export const CourseGallery = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  @media (min-width: ${theme.breakpoints.lg}) {
    flex-direction: row;
    align-items: flex-start;
    gap: ${theme.spacing.lg};
    inline-size: 780px;
    max-inline-size: 100%;
  }

  /* The bleed lives here, not on ".slides" (moved for the round 3 finding):
     the arrows and the counter are positioned against this box, so it has
     to span the same full-viewport width ".slides" itself scrolls across,
     with ".slides" own padding-inline (unchanged) making the peek. Because
     this box is wider than the current slide it frames, the prev arrow and
     the counter need their own start and end insets pulled in by that same
     padding, so they land on the photo itself; the next arrow keeps the
     shared fragment's own plain inset, since that is exactly where the
     peek already sits. */
  > .stage {
    position: relative;
    margin-inline: calc(-1 * ${theme.spacing.lg});

    @media (min-width: ${theme.breakpoints.md}) {
      margin-inline: calc(-1 * ${theme.spacing.xl});
    }

    @media (min-width: ${theme.breakpoints.lg}) {
      display: none;
    }

    ${arrowAndCounterFragment(theme)}

    > .arrow.prev {
      inset-inline-start: calc(${theme.spacing.lg} + ${theme.spacing.sm});

      @media (min-width: ${theme.breakpoints.md}) {
        inset-inline-start: calc(${theme.spacing.xl} + ${theme.spacing.sm});
      }
    }

    > .counter {
      inset-inline-end: calc(${theme.spacing.lg} + ${theme.spacing.sm});

      @media (min-width: ${theme.breakpoints.md}) {
        inset-inline-end: calc(${theme.spacing.xl} + ${theme.spacing.sm});
      }
    }
  }

  > .slides {
    display: flex;
    gap: ${theme.spacing.sm};
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    overscroll-behavior-inline: contain;
    scrollbar-width: none;
    padding-inline: ${theme.spacing.lg};

    &::-webkit-scrollbar {
      display: none;
    }

    @media (min-width: ${theme.breakpoints.md}) {
      padding-inline: ${theme.spacing.xl};
    }

    > .slide {
      flex: 0 0 calc(100vw - 48px);
      aspect-ratio: 1;
      scroll-snap-align: start;
      overflow: hidden;
      border-radius: ${theme.radii.lg};
      background: ${theme.colors.primarySoft};
      padding: 0;
      border: 0;

      > .image {
        display: block;
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
      }
    }
  }

  > .frame {
    display: none;
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.primarySoft};

    @media (min-width: ${theme.breakpoints.lg}) {
      display: block;
      flex: 0 0 560px;
      inline-size: 560px;
      block-size: 560px;
    }

    > .imageButton {
      display: block;
      inline-size: 100%;
      block-size: 100%;
      padding: 0;
      border: 0;
      background: none;
      cursor: zoom-in;

      > .image {
        display: block;
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
      }
    }

    ${arrowAndCounterFragment(theme)}

    > .counter {
      inset-block-end: ${theme.spacing.md};
      inset-inline-end: ${theme.spacing.md};
    }
  }

  > .thumbnails {
    display: flex;
    gap: ${theme.spacing.sm};
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    @media (min-width: ${theme.breakpoints.lg}) {
      flex: 1 1 auto;
      display: grid;
      grid-template-columns: repeat(2, 98px);
      overflow: visible;
      align-content: start;
    }

    > .thumbnail {
      flex: 0 0 56px;
      inline-size: 56px;
      block-size: 56px;
      overflow: hidden;
      border-radius: ${theme.radii.sm};
      border: 2px solid transparent;
      padding: 0;
      background: ${theme.colors.primarySoft};

      &.active {
        border-color: ${theme.colors.primary};
      }

      @media (min-width: ${theme.breakpoints.lg}) {
        flex-basis: auto;
        inline-size: 98px;
        block-size: 98px;
      }

      > img {
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
      }
    }
  }
`,
);
