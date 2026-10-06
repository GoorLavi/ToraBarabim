import { css } from 'styled-components';

// The light tone is the QuietButton look (components/QuietButton/styles.ts);
// the plum tone is an outline on a primary field, as the page heroes draw
// their other quiet controls.
export const ShareButton = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.sm};

  > .button {
    display: inline-grid;
    grid-template-columns: auto auto;
    align-items: center;
    column-gap: ${theme.spacing.sm};
    min-block-size: 48px;
    padding-block: 11px;
    padding-inline: ${theme.spacing.xl};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.surface};
    color: ${theme.colors.primary};
    font-family: inherit;
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
    cursor: pointer;

    &:hover,
    &:active {
      border-color: ${theme.colors.primary};
      color: ${theme.colors.primaryStrong};
    }

    &:focus-visible {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
    }

    > .icon {
      grid-row: 1;
      grid-column: 1;
      block-size: 20px;
      inline-size: 20px;
    }

    > .label {
      grid-row: 1;
      grid-column: 2;
      white-space: nowrap;

      &.hidden {
        visibility: hidden;
      }
    }
  }

  &.plum > .button {
    border-color: ${theme.colors.borderOnPrimary};
    background: transparent;
    color: ${theme.colors.textOnPrimary};

    &:hover,
    &:active {
      border-color: ${theme.colors.textOnPrimary};
      background: ${theme.colors.surfaceOnPrimary};
      color: ${theme.colors.textOnPrimary};
    }

    &:focus-visible {
      outline-color: ${theme.colors.textOnPrimary};
    }
  }

  > .notice {
    margin: 0;
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};

    &.visuallyHidden {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  }

  &.plum > .notice {
    color: ${theme.colors.textOnPrimaryMuted};
  }

  > .fallback {
    inline-size: 100%;

    > .value {
      padding-block: ${theme.spacing.sm};
      overflow-wrap: anywhere;
    }
  }
`,
);
