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

    > .sheetScrim {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      /* No colors.scrim token exists yet, so this mirrors ResponsiveSheet's
         own raw value (client/src/RabbiPanel/components/ResponsiveSheet)
         rather than inventing a second one. */
      background: rgba(32, 27, 29, 0.45);
      animation: dateFilterScrimIn 160ms ease-out;

      > .sheetPanel {
        inline-size: 100%;
        max-block-size: 90vh;
        display: flex;
        flex-direction: column;
        background: ${theme.colors.surface};
        border-start-start-radius: ${theme.radii.lg};
        border-start-end-radius: ${theme.radii.lg};
        border-end-start-radius: 0;
        border-end-end-radius: 0;
        box-shadow: ${theme.shadows.raised};
        padding-block: ${theme.spacing.lg};
        padding-inline: ${theme.spacing.sm};
        overflow-y: auto;
        animation: dateFilterSheetSlideIn 160ms ease-out;

        @media (prefers-reduced-motion: reduce) {
          animation: none;
        }

        > .sheetHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-inline: ${theme.spacing.sm};
          padding-block-end: ${theme.spacing.md};

          > .sheetTitle {
            color: ${theme.colors.text};
            font-size: ${theme.typography.sectionHeading.phone.fontSize};
            line-height: ${theme.typography.sectionHeading.phone.lineHeight};
            font-weight: ${theme.typography.fontWeight.bold};
          }

          > .closeButton {
            display: flex;
            align-items: center;
            justify-content: center;
            inline-size: 48px;
            block-size: 48px;
            border: none;
            border-radius: ${theme.radii.md};
            background: transparent;
            color: ${theme.colors.text};

            > svg {
              inline-size: 24px;
              block-size: 24px;
            }
          }
        }
      }
    }

    > .popoverPanel {
      position: absolute;
      z-index: 20;
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

  @keyframes dateFilterScrimIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes dateFilterSheetSlideIn {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
`,
);
