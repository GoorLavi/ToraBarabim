import { css } from 'styled-components';

// `:not(:first-child)` rather than a border owned by the parent grid, so the
// parent never has to compute which child starts a new visual row. What this
// actually guarantees: a hairline above every field but the first in source
// order. That reads correctly on both pages today because neither puts two
// fields in its top visual row, so no field but the first is ever at the top
// of the card. A page whose first row held two fields would draw a hairline
// above the second one, at the card's top edge.
export const RecordField = css(
  ({ theme }) => `
  display: flex;
  align-items: baseline;
  gap: ${theme.spacing.sm};
  padding-block: ${theme.spacing.sm};

  &:not(:first-child) {
    border-block-start: 1px solid ${theme.colors.border};
  }

  &.wide {
    grid-column: 1 / -1;
  }

  > .label {
    /* Grows past 84 rather than wrapping: the longest label on these pages
       ('קומה או הוראות הגעה') overruns 84px at this size, and a fixed basis
       would wrap it onto a second and third line, making that one row two or
       three times its neighbours' height on the narrowest screen. */
    flex: 0 1 auto;
    min-inline-size: 84px;
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
