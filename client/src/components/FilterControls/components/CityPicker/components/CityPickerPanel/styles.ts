import { css } from 'styled-components';

// Only the search field and the scrolling region below it: the handle,
// heading row and hairline are `PanelFrame`'s own styles, applied to the
// same root this `className` reaches.
export const CityPickerPanel = css(
  ({ theme }) => `
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
