import { css } from 'styled-components';

export const RecurrenceFields = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};

  > .kindToggle {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.sm};

    > .kindOption {
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.pill};
      color: ${theme.colors.text};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};

      &.selected {
        border-color: ${theme.colors.primary};
        background: ${theme.colors.primarySoft};
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
      }
    }
  }

  > .weekdays {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.xs};

    > .weekday {
      min-inline-size: 48px;
      min-block-size: 48px;
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.pill};
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};

      &.selected {
        border-color: ${theme.colors.primary};
        background: ${theme.colors.primary};
        color: ${theme.colors.textOnPrimary};
      }
    }
  }

  > .error {
    color: ${theme.colors.danger};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .row {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.md};
  }

  > .field,
  > .row > .field {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    flex: 1;
    min-inline-size: 160px;

    > .label {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > input {
      min-block-size: 48px;
      padding-inline: ${theme.spacing.md};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.surface};
      color: ${theme.colors.text};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }

    > .error {
      color: ${theme.colors.danger};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }
`,
);
