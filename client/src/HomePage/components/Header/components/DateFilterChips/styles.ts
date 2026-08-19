import { css } from 'styled-components';

export const DateFilterChips = css(
  ({ theme }) => `
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};

  > .chip {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
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

    /* The path only fills half of its 24-unit viewBox, so a 28px box
       renders the glyph itself at roughly 14px, matched to the label's
       weight rather than reading as a faint afterthought (design review,
       item 7). */
    > .clearGlyph {
      inline-size: 28px;
      block-size: 28px;
    }
  }

  > .calendar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.xs};
    min-inline-size: 48px;
    min-block-size: 48px;
    padding-inline: ${theme.spacing.sm};
    border: 1px solid ${theme.colors.textOnPrimary};
    border-radius: ${theme.radii.pill};
    background: transparent;
    color: ${theme.colors.textOnPrimary};
    font-size: ${theme.typography.tagAndCaption.phone.fontSize};
    line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
    font-weight: ${theme.typography.tagAndCaption.fontWeight};

    &.selected {
      padding-inline: ${theme.spacing.lg};
      background: ${theme.colors.surface};
      border-color: ${theme.colors.surface};
      color: ${theme.colors.primary};
    }

    > .icon {
      inline-size: 20px;
      block-size: 20px;
      pointer-events: none;
    }

    /* The path only fills half of its 24-unit viewBox, so a 28px box
       renders the glyph itself at roughly 14px, matched to the label's
       weight rather than reading as a faint afterthought (design review,
       item 7). */
    > .clearGlyph {
      inline-size: 28px;
      block-size: 28px;
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
