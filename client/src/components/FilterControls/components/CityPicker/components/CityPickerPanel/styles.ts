import { css } from 'styled-components';

// The fixed region (handle, heading, search) never scrolls; only
// `.scrollRegion` below the hairline does (build spec, "Panel anatomy").
// The root is a programmatic focus target (`tabIndex={-1}`, focused below
// `sm` instead of the search field), not itself a user-facing control, so
// it suppresses its own outline rather than adding a ring the interactive
// children below already carry.
export const CityPickerPanel = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  min-block-size: 0;
  overflow: hidden;

  &:focus-visible {
    outline: none;
  }

  > .handle {
    align-self: center;
    inline-size: 36px;
    block-size: 4px;
    margin-block: ${theme.spacing.sm};
    border-radius: ${theme.radii.pill};
    background: ${theme.colors.border};
    flex-shrink: 0;
  }

  > .headingRow {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing.md};
    padding-inline: ${theme.spacing.lg};
    padding-block: ${theme.spacing.md};

    > .heading {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.sectionHeading.fontWeight};
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    }

    > .close {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: 48px;
      block-size: 48px;
      border: none;
      border-radius: ${theme.radii.md};
      background: transparent;
      color: ${theme.colors.text};

      &:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
      }

      > svg {
        inline-size: 24px;
        block-size: 24px;
      }
    }
  }

  > .searchRow {
    flex-shrink: 0;
    position: relative;
    padding-inline: ${theme.spacing.lg};
    padding-block-end: ${theme.spacing.md};

    > .search {
      inline-size: 100%;
      min-block-size: 48px;
      padding-inline-start: ${theme.spacing.md};
      padding-inline-end: 56px;
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      color: ${theme.colors.text};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};

      &:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
      }
    }

    > .clear {
      position: absolute;
      inset-inline-end: ${theme.spacing.lg};
      inset-block-start: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: 48px;
      block-size: 48px;
      border: none;
      border-radius: ${theme.radii.md};
      background: transparent;
      color: ${theme.colors.textSecondary};

      &:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
      }

      > svg {
        inline-size: 20px;
        block-size: 20px;
      }
    }
  }

  > .hairline {
    flex-shrink: 0;
    border-block-end: 1px solid ${theme.colors.border};
  }

  > .scrollRegion {
    flex: 1;
    min-block-size: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-inline: ${theme.spacing.lg};
    padding-block-start: ${theme.spacing.lg};
    padding-block-end: max(32px, calc(env(safe-area-inset-bottom) + 16px));
  }
`,
);
