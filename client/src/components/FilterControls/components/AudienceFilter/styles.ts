import { css } from 'styled-components';

// Shaped like CityPicker: same pill, so the two read as a matched pair in
// the header.
export const AudienceFilter = css(
  ({ theme }) => `
  position: relative;
  display: flex;
  align-items: center;
  /* Exactly 48, matching the search field beside it (design review, frame
     9:94): the row this sits in only reads as 48 tall if neither child adds
     height of its own. */
  block-size: 48px;

  > .pill {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    block-size: 48px;
    padding-inline: ${theme.spacing.lg};
    border-radius: ${theme.radii.pill};
    background: ${theme.colors.surface};
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
    white-space: nowrap;

    > .icon {
      flex-shrink: 0;
      inline-size: 18px;
      block-size: 18px;
    }

    > .label {
      max-inline-size: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    > .chevron {
      flex-shrink: 0;
      inline-size: 16px;
      block-size: 16px;
    }

    &.selected {
      color: ${theme.colors.primaryStrong};
    }
  }

  > .popover {
    position: absolute;
    z-index: 20;
    inset-block-start: calc(100% + ${theme.spacing.xs});
    inset-inline-end: 0;
    inline-size: max-content;
    min-inline-size: 240px;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.sm};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.surface};
    box-shadow: ${theme.shadows.raised};

    > .popoverHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-inline: ${theme.spacing.sm};
      padding-block-start: ${theme.spacing.xs};

      > .popoverTitle {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .closeButton {
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 32px;
        block-size: 32px;
        border-radius: ${theme.radii.pill};
        color: ${theme.colors.textSecondary};

        > .closeIcon {
          inline-size: 16px;
          block-size: 16px;
        }
      }
    }

    > .options {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xs};

      > .option {
        > button {
          inline-size: 100%;
          min-block-size: 48px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          padding-block: ${theme.spacing.xs};
          padding-inline: ${theme.spacing.md};
          border-radius: ${theme.radii.sm};
          text-align: start;
          color: ${theme.colors.text};

          > .label {
            font-size: ${theme.typography.body.phone.fontSize};
            line-height: ${theme.typography.body.phone.lineHeight};
          }

          > .subLabel {
            color: ${theme.colors.textSecondary};
            font-size: ${theme.typography.tagAndCaption.phone.fontSize};
            line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
          }

          &[aria-selected='true'] {
            background: ${theme.colors.primarySoft};
            color: ${theme.colors.primary};

            > .label {
              font-weight: ${theme.typography.fontWeight.semiBold};
            }
          }

          &:hover {
            background: ${theme.colors.primarySoft};
          }
        }
      }
    }
  }
`,
);
