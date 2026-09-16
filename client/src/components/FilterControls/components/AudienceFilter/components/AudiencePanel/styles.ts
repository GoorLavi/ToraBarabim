import { css } from 'styled-components';

// Only the options list: the handle, heading row and hairline are
// `PanelFrame`'s own styles, applied to the same root this `className`
// reaches.
export const AudiencePanel = css(
  ({ theme }) => `
  > .options {
    flex: 1;
    min-block-size: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    padding-block-end: max(${theme.spacing.sm}, calc(env(safe-area-inset-bottom) + ${theme.spacing.xs}));

    > .option {
      > .optionButton {
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

        &[aria-pressed='true'] {
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
`,
);
