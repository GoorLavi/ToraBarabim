import { css } from 'styled-components';

// Never a `color.danger` fill: the error card is a plain `surface` card with
// normal text, and `danger` stays text-only (00-shared-shell.md, "The state
// card"). Fills the content column, with no width cap: the pre-consolidation
// NotFoundScreen centred itself and capped at 480, which this round's
// measured frames do not draw.
export const StateCard = css(
  ({ theme }) => `
  inline-size: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.radii.lg};
  text-align: start;

  &.surface {
    background: ${theme.colors.surface};
    border: 1px solid ${theme.colors.border};
  }

  &.empty {
    background: ${theme.colors.accentSoft};
  }

  > .heading {
    font-size: ${theme.typography.cardTitle.phone.fontSize};
    line-height: ${theme.typography.cardTitle.phone.lineHeight};
    font-weight: ${theme.typography.fontWeight.bold};
    color: ${theme.colors.text};
  }

  > .body {
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
    color: ${theme.colors.textSecondary};
  }

  > .action {
    align-self: flex-start;
  }
`,
);
