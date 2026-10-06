import { css } from 'styled-components';

export const CalendarSheet = css(
  ({ theme }) => `
  > .panel {
    > .headingRow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: ${theme.spacing.md};

      > .heading {
        flex: 1 1 auto;
        min-inline-size: 0;
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.bold};
        font-size: ${theme.typography.sectionHeading.phone.fontSize};
        line-height: ${theme.typography.sectionHeading.phone.lineHeight};

        &:focus {
          outline: none;
        }
      }

      > .roundButton {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 48px;
        block-size: 48px;
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.pill};
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

    > .question {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }

    > .chosenCalendar {
      display: flex;
      align-items: center;
      gap: ${theme.spacing.sm};
      color: ${theme.colors.textSecondary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};

      > svg {
        flex: 0 0 auto;
        inline-size: 20px;
        block-size: 20px;
      }
    }

    > .choice {
      display: flex;
      align-items: center;
      gap: ${theme.spacing.md};
      min-block-size: 48px;
      padding: ${theme.spacing.lg};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.surface};
      text-align: start;

      &:hover,
      &:active {
        border-color: ${theme.colors.primary};
      }

      &:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
      }

      > .choiceIcon {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 40px;
        block-size: 40px;
        border-radius: ${theme.radii.pill};
        background: ${theme.colors.primarySoft};
        color: ${theme.colors.primary};

        > svg {
          inline-size: 20px;
          block-size: 20px;
        }
      }

      > .choiceMark {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 40px;
        block-size: 40px;

        > svg {
          inline-size: 32px;
          block-size: 32px;
        }
      }

      > .choiceText {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.xs};

        > .choiceTitle {
          color: ${theme.colors.text};
          font-weight: ${theme.typography.fontWeight.semiBold};
          font-size: ${theme.typography.body.phone.fontSize};
          line-height: ${theme.typography.body.phone.lineHeight};
        }

        > .choiceLine {
          color: ${theme.colors.textSecondary};
          font-size: ${theme.typography.secondary.phone.fontSize};
          line-height: ${theme.typography.secondary.phone.lineHeight};
        }
      }
    }
  }
`,
);
