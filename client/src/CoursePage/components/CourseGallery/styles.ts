import { css } from 'styled-components';

// Below `lg`: the full-bleed, swipeable strip of every photo stays on top
// (design brief A items 1 and 2), each slide the viewport width less 48px
// so the next one peeks at the inline end, the same bleed technique as
// `HomePage/components/RabbiRow/styles.ts`'s own `.row`; the frame and the
// thumbnail strip (design gate round 2 finding) sit stacked underneath it at
// every width too, not desktop-only, since the arrows help a reader who
// never discovers the swipe. From `lg` up (design brief A, item 7): the
// frame grows to its own fixed 560 square beside a 2-column thumbnail grid,
// the slides strip hidden (the frame is the browsing surface there).
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

  > .slides {
    display: flex;
    gap: ${theme.spacing.sm};
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    overscroll-behavior-inline: contain;
    scrollbar-width: none;
    margin-inline: calc(-1 * ${theme.spacing.lg});
    padding-inline: ${theme.spacing.lg};

    &::-webkit-scrollbar {
      display: none;
    }

    @media (min-width: ${theme.breakpoints.md}) {
      margin-inline: calc(-1 * ${theme.spacing.xl});
      padding-inline: ${theme.spacing.xl};
    }

    @media (min-width: ${theme.breakpoints.lg}) {
      display: none;
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
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.primarySoft};

    @media (min-width: ${theme.breakpoints.lg}) {
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

      @media (min-width: ${theme.breakpoints.lg}) {
        inset-block-end: ${theme.spacing.md};
        inset-inline-end: ${theme.spacing.md};
      }
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
