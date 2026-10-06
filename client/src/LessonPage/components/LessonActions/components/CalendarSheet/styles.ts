import { css } from 'styled-components';

export const CalendarSheet = css(
  ({ theme }) => `
  > .panel {
    > .heading {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.bold};
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    }

    > .choice {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: ${theme.spacing.xs};
      min-block-size: 48px;
      padding: ${theme.spacing.md} ${theme.spacing.lg};
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

      > .choiceTitle {
        color: ${theme.colors.primary};
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

    > .close {
      min-block-size: 48px;
      color: ${theme.colors.textSecondary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};

      &:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
        border-radius: ${theme.radii.sm};
      }
    }
  }
`,
);
