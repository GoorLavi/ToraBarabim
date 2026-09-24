import { css } from 'styled-components';

// Below `lg`: the square frame, then a horizontal thumbnail strip under it.
// From `lg` up (design brief A, item 7): a fixed 780 by 560 block, the
// frame at 560 square, a 2-column thumbnail grid beside it.
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
    gap: ${theme.spacing.xs};
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    @media (min-width: ${theme.breakpoints.lg}) {
      flex: 1 1 auto;
      display: grid;
      grid-template-columns: repeat(2, 98px);
      gap: ${theme.spacing.sm};
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
