import { css } from 'styled-components';

// Course (name and thumbnail), teacher, opening, weeks, city, status,
// actions: matches the DOM order in CoursesTable.tsx.
const GRID_COLUMNS = 'minmax(0, 1.6fr) minmax(0, 1fr) 110px 110px 120px 140px 96px';

export const CoursesTable = css(
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

    > .course {
      display: flex;
      align-items: center;
      gap: ${theme.spacing.sm};
      min-inline-size: 0;

      > .thumbnail {
        flex: 0 0 36px;
        inline-size: 36px;
        block-size: 48px;
        border-radius: ${theme.radii.sm};
        object-fit: cover;
      }

      > .title {
        min-inline-size: 0;
        overflow-wrap: break-word;
        font-weight: ${theme.typography.fontWeight.semiBold};

        > .cycle {
          color: ${theme.colors.textSecondary};
          font-weight: ${theme.typography.fontWeight.regular};
        }
      }
    }

    > .statusCol > .tag {
      inline-size: fit-content;
      padding-block: 2px;
      padding-inline: ${theme.spacing.sm};
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.primarySoft};
      color: ${theme.colors.text};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};

      /* A closed or full status is a terminal state (design gate finding),
         filled solid rather than the soft tint an open status keeps. */
      &.terminal {
        background: ${theme.colors.primary};
        color: ${theme.colors.textOnPrimary};
      }
    }

    > .actions > .details {
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
