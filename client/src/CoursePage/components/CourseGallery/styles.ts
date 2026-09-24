import { css } from 'styled-components';

export const CourseGallery = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  > .frame {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.primarySoft};

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
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.scrim};
      color: ${theme.colors.textOnPrimary};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      font-weight: ${theme.typography.tagAndCaption.fontWeight};
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

      > img {
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
      }
    }
  }
`,
);
