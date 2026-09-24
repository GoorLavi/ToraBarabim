import { css } from 'styled-components';

// Mirrors LessonListItem/styles.ts. The closed-or-full state adds one row
// of its own (tag and line, never apart, design brief B item 3) in place
// of the open state's separate audience-and-city tags.
export const CourseListItem = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};
  box-shadow: ${theme.shadows.card};

  > .title {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.cardTitle.fontWeight};
    font-size: ${theme.typography.cardTitle.phone.fontSize};
    line-height: ${theme.typography.cardTitle.phone.lineHeight};

    > .cycle {
      color: ${theme.colors.textSecondary};
      font-weight: ${theme.typography.fontWeight.regular};
    }
  }

  > .when {
    margin-block-start: 2px;
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .tags {
    margin-block-start: ${theme.spacing.sm};
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.xs};

    > .tag {
      padding-block: 2px;
      padding-inline: ${theme.spacing.sm};
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.primarySoft};
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};

      &.open {
        background: ${theme.colors.accentSoft};
      }
    }
  }

  > .closedRow {
    margin-block-start: ${theme.spacing.sm};
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${theme.spacing.xs};

    > .tag {
      flex: 0 0 auto;
      padding-block: 2px;
      padding-inline: ${theme.spacing.sm};
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
    }

    > .closedLine {
      min-inline-size: 0;
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }

  > .action {
    align-self: flex-start;
    margin-block-start: ${theme.spacing.md};
    display: flex;
    align-items: center;
    min-block-size: 48px;
    padding-inline: ${theme.spacing.lg};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.md};
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
  }
`,
);
