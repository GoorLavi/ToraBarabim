import { css } from 'styled-components';

// Lesson and rabbi lead (the only thing identifying a row), then when,
// city, audience, actions: matches the DOM order in LessonsTable.tsx, which
// reads right-to-left in this RTL layout. Explicit proportions rather than
// letting column one take a bare 1fr of the slack: that left an empty band
// of roughly 455px between the lesson title and the "when" column's own
// content at the 1232 content width.
const GRID_COLUMNS = 'minmax(0, 1.4fr) minmax(0, 1fr) 140px 160px 96px';

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
      align-items: center;
      gap: ${theme.spacing.sm};

      > .whenText {
        overflow-wrap: break-word;
      }

      > .tag {
        flex: 0 0 auto;
        inline-size: fit-content;
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
      display: flex;
      align-items: center;
      min-block-size: 48px;
      color: ${theme.colors.primary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      text-decoration: none;

      @media (hover: hover) and (pointer: fine) {
        &:hover {
          text-decoration: underline;
        }
      }

      &:focus-visible {
        text-decoration: underline;
      }
    }
  }
`,
);
