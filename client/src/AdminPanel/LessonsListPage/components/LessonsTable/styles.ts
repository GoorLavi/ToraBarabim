import { css } from 'styled-components';

// Lesson and rabbi lead (the only thing identifying a row), then when,
// city, audience, actions: matches the DOM order in `LessonsTable.tsx`,
// which reads right-to-left in this RTL layout.
const GRID_COLUMNS = '2fr 1fr 140px 110px 90px';

export const LessonsTable = css(
  ({ theme }) => `
  display: none;

  @media (min-width: ${theme.breakpoints.md}) {
    display: flex;
    flex-direction: column;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.surface};
    overflow: hidden;
  }

  > .headRow,
  > .row {
    display: grid;
    grid-template-columns: ${GRID_COLUMNS};
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md};
  }

  > .headRow {
    background: ${theme.colors.primarySoft};
    color: ${theme.colors.textSecondary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.tagAndCaption.phone.fontSize};
    line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
  }

  > .row {
    border-block-start: 1px solid ${theme.colors.border};
    color: ${theme.colors.text};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};

    > .when {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;

      > .time {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .tag {
        width: fit-content;
        padding-inline: ${theme.spacing.xs};
        border-radius: ${theme.radii.sm};
        background: ${theme.colors.accentSoft};
        color: ${theme.colors.text};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      }
    }

    > .lesson {
      display: flex;
      flex-direction: column;

      > .primary {
        font-weight: ${theme.typography.fontWeight.semiBold};
      }

      > .secondary {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }

    > .actions > .edit {
      color: ${theme.colors.primary};
      font-weight: ${theme.typography.fontWeight.semiBold};
    }
  }
`,
);
