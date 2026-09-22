import { css } from 'styled-components';

export const PlacePicker = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  > .helper {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  /* The element that turns the block below it into a fork rather than a
     required first step: it stays in place and goes quiet once a place is
     chosen, instead of vanishing and making the layout jump. */
  > .orDivider {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding-block: ${theme.spacing.xs};

    > .line {
      flex: 1;
      block-size: 1px;
      background: ${theme.colors.border};
    }

    > .label {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }

  > .reason {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .field {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    align-items: flex-start;

    > .label {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > input {
      inline-size: 100%;
      min-block-size: 48px;
      padding-inline: ${theme.spacing.md};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.surface};
      color: ${theme.colors.text};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }

    > .helper {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .error {
      color: ${theme.colors.danger};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }
`,
);
