import { css } from 'styled-components';

export const OccurrencesSection = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  > .heading {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.fontWeight.bold};
    font-size: ${theme.typography.sectionHeading.phone.fontSize};
    line-height: ${theme.typography.sectionHeading.phone.lineHeight};
  }

  > .note {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .mutationError {
    padding: ${theme.spacing.sm};
    border-radius: ${theme.radii.sm};
    background: ${theme.colors.accentSoft};
    color: ${theme.colors.danger};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .skeleton {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};

    > .skeletonRow {
      block-size: 108px;
      border-radius: ${theme.radii.md};
      background: ${theme.colors.border};
    }
  }

  > .state {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.surface};

    > .headline {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }

    > .hint {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    &.error > .headline {
      color: ${theme.colors.danger};
    }

    > .retry {
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};
      font-weight: ${theme.typography.fontWeight.semiBold};
    }
  }

  > .rows {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};

    > .exceptionsWarning {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: ${theme.spacing.sm};
      padding: ${theme.spacing.sm};
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.accentSoft};

      > .message {
        color: ${theme.colors.danger};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      /* A bordered pill, not the filled one the section's own error state
         uses (above): distinct enough to read as "try again", not styled
         as heavily as the primary action a genuine dead end offers. An
         underlined plain-text button here read as a link on a normal
         load, not as something waiting to be pressed. */
      > .retry {
        display: flex;
        align-items: center;
        min-block-size: 48px;
        padding-inline: ${theme.spacing.lg};
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.pill};
        background: ${theme.colors.surface};
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
      }
    }
  }
`,
);
