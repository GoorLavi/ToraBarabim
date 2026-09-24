import { css } from 'styled-components';

// Styles `ResponsiveSheet`'s own public `.panel` slot directly, the same
// way `DedicationWindow/styles.ts` does: a wider, padding-free panel so a
// whole, uncropped photo can fill it edge to edge.
export const PhotoViewer = css(
  ({ theme }) => `
  > .panel {
    position: relative;
    max-inline-size: 640px;
    padding: 0;
    gap: 0;
    overflow: hidden;

    > .close {
      position: absolute;
      inset-block-start: ${theme.spacing.md};
      inset-inline-end: ${theme.spacing.md};
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: 48px;
      block-size: 48px;
      border: none;
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.surfaceOnPrimary};
      color: ${theme.colors.textOnPrimary};

      > svg {
        inline-size: 20px;
        block-size: 20px;
      }
    }

    > .stage {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      block-size: 70vh;
      background: ${theme.colors.text};

      > .image {
        max-inline-size: 100%;
        max-block-size: 100%;
        object-fit: contain;
      }

      > .arrow {
        position: absolute;
        inset-block-start: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 48px;
        block-size: 48px;
        border: none;
        border-radius: ${theme.radii.pill};
        background: ${theme.colors.surfaceOnPrimary};
        color: ${theme.colors.textOnPrimary};

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
    }

    > .counter {
      padding-block: ${theme.spacing.sm};
      text-align: center;
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }
`,
);
