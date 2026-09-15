import { css } from 'styled-components';

export const DateFilterChips = css(
  ({ theme }) => `
  display: flex;
  /* Safety valve, not a normal state: the numeric custom-date label
     (HomePage/helpers.ts, numericDayLabel) keeps the row on one line at
     375 by design, so wrapping here should only ever fire for a case
     nobody has hit yet. */
  flex-wrap: wrap;
  /* spacing.sm (8px), the tap-target minimum, measured 7px in the browser:
     bumped to the next token so the row clears the floor with margin
     rather than sitting exactly on it (design review nit). */
  gap: ${theme.spacing.md};

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

  > .calendarWrapper {
    position: relative;

    > .calendar {
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

      &.open,
      &.selected {
        background: ${theme.colors.surface};
        border-color: ${theme.colors.surface};
        color: ${theme.colors.primary};
      }

      &.selected {
        padding-inline: ${theme.spacing.lg};
      }

      > .icon {
        inline-size: 20px;
        block-size: 20px;
        pointer-events: none;
      }
    }

    > .popoverPanel {
      position: absolute;
      z-index: ${theme.zIndex.popover};
      inset-block-start: calc(100% + ${theme.spacing.xs});
      inset-inline-start: 0;
      inline-size: auto;
      padding: ${theme.spacing.md};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.surface};
      box-shadow: ${theme.shadows.raised};
    }
  }
`,
);
