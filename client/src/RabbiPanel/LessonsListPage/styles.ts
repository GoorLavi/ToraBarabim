import { css } from 'styled-components';

export const LessonsListPage = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;

  > .heading {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.pageHeading.fontWeight};
    font-size: ${theme.typography.pageHeading.phone.fontSize};
    line-height: ${theme.typography.pageHeading.phone.lineHeight};

    @media (min-width: ${theme.breakpoints.md}) {
      font-size: ${theme.typography.pageHeading.desktop.fontSize};
      line-height: ${theme.typography.pageHeading.desktop.lineHeight};
    }
  }

  > .subtext {
    margin-block-start: ${theme.spacing.sm};
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  > .add {
    align-self: flex-start;
    margin-block-start: ${theme.spacing.md};
    display: flex;
    align-items: center;
    min-block-size: 48px;
    padding-inline: ${theme.spacing.xl};
    border-radius: ${theme.radii.pill};
    background: ${theme.colors.primary};
    color: ${theme.colors.textOnPrimary};
    font-weight: ${theme.typography.fontWeight.semiBold};
  }

  > .state {
    margin-block-start: ${theme.spacing.xxl};
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.xxl} ${theme.spacing.sm};
    text-align: center;

    > .headline {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.bold};
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    }

    > .hint {
      max-inline-size: 320px;
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }

    > .cta {
      margin-block-start: ${theme.spacing.md};
      display: flex;
      align-items: center;
      justify-content: center;
      min-block-size: 48px;
      padding-inline: ${theme.spacing.xl};
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};
      font-weight: ${theme.typography.fontWeight.semiBold};

      &.ghost {
        background: none;
        border: 1px solid ${theme.colors.border};
        color: ${theme.colors.primary};
      }
    }
  }

  > .skeleton {
    margin-block-start: ${theme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};

    > .skeletonCard {
      block-size: 128px;
      border-radius: ${theme.radii.lg};
      background: ${theme.colors.surface};
      border: 1px solid ${theme.colors.border};
    }
  }

  > .list {
    margin-block-start: ${theme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
  }
`,
);
