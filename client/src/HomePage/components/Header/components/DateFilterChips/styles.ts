import { css } from 'styled-components';

export const DateFilterChips = css(
  ({ theme }) => `
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};

  > .chip {
    min-block-size: 48px;
    padding-inline: ${theme.spacing.lg};
    border: 1px solid ${theme.colors.textOnPrimary};
    border-radius: ${theme.radii.pill};
    background: transparent;
    color: ${theme.colors.textOnPrimary};
    font-size: ${theme.typography.tagAndCaption.phone.fontSize};
    line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
    font-weight: ${theme.typography.tagAndCaption.fontWeight};

    &.selected {
      background: ${theme.colors.surface};
      border-color: ${theme.colors.surface};
      color: ${theme.colors.primary};
    }
  }

  > .calendar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    inline-size: 48px;
    block-size: 48px;
    border: 1px solid ${theme.colors.textOnPrimary};
    border-radius: ${theme.radii.pill};
    color: ${theme.colors.textOnPrimary};

    &.selected {
      background: ${theme.colors.surface};
      border-color: ${theme.colors.surface};
      color: ${theme.colors.primary};
    }

    > .icon {
      inline-size: 20px;
      block-size: 20px;
      pointer-events: none;
    }

    > .dateInput {
      position: absolute;
      inset: 0;
      inline-size: 100%;
      block-size: 100%;
      opacity: 0;
      cursor: pointer;
    }
  }
`,
);
