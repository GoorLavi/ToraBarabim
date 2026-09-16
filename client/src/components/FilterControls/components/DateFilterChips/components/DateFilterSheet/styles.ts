import { css } from 'styled-components';

// Targets `ResponsiveSheet`'s own `.panel`, the shell's public slot for a
// sheet's own content (see the comment on that component's styles.ts).
// `HebrewDatePicker`'s `sheet` surface (components/HebrewDatePicker) was
// built assuming a narrower inline padding than the shell's own default, so
// its day grid can sit flush with the sheet's edge while its own header and
// footer rows add a further inset on top of it; this keeps that narrower
// padding, and applies the same extra inset to the heading row so it lines
// up with those rows instead of the flush grid below it.
export const DateFilterSheet = css(
  ({ theme }) => `
  > .panel {
    padding-block: ${theme.spacing.lg};
    padding-inline: ${theme.spacing.sm};

    > .content {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.md};

      > .headingRow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${theme.spacing.md};
        padding-inline: ${theme.spacing.sm};

        > .heading {
          color: ${theme.colors.text};
          font-weight: ${theme.typography.fontWeight.bold};
          font-size: ${theme.typography.sectionHeading.phone.fontSize};
          line-height: ${theme.typography.sectionHeading.phone.lineHeight};
        }

        > .closeButton {
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
    }
  }
`,
);
