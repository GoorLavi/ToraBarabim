import { css } from 'styled-components';

export const InstallSteps = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

  > .headline {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.sectionHeading.fontWeight};
    font-size: ${theme.typography.sectionHeading.phone.fontSize};
    line-height: ${theme.typography.sectionHeading.phone.lineHeight};
  }

  > .steps {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};

    > .step {
      display: flex;
      align-items: flex-start;
      gap: ${theme.spacing.md};

      > .number {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 32px;
        block-size: 32px;
        border-radius: ${theme.radii.pill};
        background: ${theme.colors.primarySoft};
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .body {
        flex: 1 1 0;
        min-inline-size: 0;

        > .text {
          color: ${theme.colors.text};
          font-size: ${theme.typography.body.phone.fontSize};
          line-height: ${theme.typography.body.phone.lineHeight};

          > .inlineIcon {
            display: inline-block;
            vertical-align: middle;
            color: ${theme.colors.primary};
          }
        }

        > .subText {
          margin-block-start: ${theme.spacing.xs};
          color: ${theme.colors.textSecondary};
          font-size: ${theme.typography.secondary.phone.fontSize};
          line-height: ${theme.typography.secondary.phone.lineHeight};
        }
      }

      /* Stands in for the control the step names, drawn the way it looks on
         the visitor's own screen. */
      > .tile {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 48px;
        block-size: 48px;
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.md};
        background: ${theme.colors.bg};
        color: ${theme.colors.primary};

        > .tileLabel {
          font-weight: ${theme.typography.fontWeight.semiBold};
          font-size: ${theme.typography.tagAndCaption.phone.fontSize};
          line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
        }
      }
    }
  }

  > .preview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.lg};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.primarySoft};

    > .caption {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .app {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: ${theme.spacing.xs};

      > .appIcon {
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 60px;
        block-size: 60px;
        border-radius: ${theme.radii.lg};
        background: ${theme.colors.primary};
      }

      > .appName {
        color: ${theme.colors.text};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      }
    }
  }

  > .note {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .close {
    border-color: ${theme.colors.primary};
  }
`,
);
