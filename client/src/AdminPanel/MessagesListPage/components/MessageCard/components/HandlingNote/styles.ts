import { css } from 'styled-components';

export const HandlingNote = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.xs};
  margin-block-start: ${theme.spacing.xs};

  > .label {
    color: ${theme.colors.textSecondary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .text {
    max-inline-size: 640px;
    color: ${theme.colors.text};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  > .field {
    inline-size: 100%;
    max-inline-size: 640px;
    min-block-size: 48px;
    padding-block: ${theme.spacing.sm};
    padding-inline: ${theme.spacing.md};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.surface};
    color: ${theme.colors.text};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
    resize: vertical;

    &:focus-visible {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 1px;
    }
  }

  > .failure {
    color: ${theme.colors.danger};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .actions {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.sm};

    > .save,
    > .cancel {
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border-radius: ${theme.radii.pill};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};

      &:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
      }

      &:disabled {
        opacity: 0.6;
        cursor: progress;
      }
    }

    > .save {
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};
    }

    > .cancel {
      border: 1px solid ${theme.colors.border};
      color: ${theme.colors.text};
    }
  }

  /* A text button that reaches 48 through its own padding. */
  > .trigger {
    min-block-size: 48px;
    padding-inline: ${theme.spacing.sm};
    border-radius: ${theme.radii.sm};
    /* Cancels its own padding so the label lines up with the text column. */
    margin-inline-start: calc(-1 * ${theme.spacing.sm});
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};

    &:focus-visible {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
    }
  }
`,
);
