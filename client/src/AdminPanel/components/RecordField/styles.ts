import { css } from 'styled-components';

// `:not(:first-child)` rather than a border owned by the parent grid: it
// draws a hairline above every row but the first regardless of how many
// grid columns are active at the current breakpoint or where a `.wide` row
// breaks the column pairing, so the parent never has to compute which child
// starts a new visual row.
export const RecordField = css(
  ({ theme }) => `
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
  min-block-size: 30px;
  padding-block: ${theme.spacing.sm};

  &:not(:first-child) {
    border-block-start: 1px solid ${theme.colors.border};
  }

  &.wide {
    grid-column: 1 / -1;
  }

  > .label {
    flex: 0 0 84px;
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .value {
    flex: 1;
    min-inline-size: 0;
    overflow-wrap: break-word;
    color: ${theme.colors.text};
    font-weight: ${theme.typography.fontWeight.regular};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  &.empty > .value {
    color: ${theme.colors.textSecondary};
  }
`,
);
