import { css } from 'styled-components';

export const LessonsSection = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};

  > .heading {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};

    > .title {
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};
      font-weight: ${theme.typography.sectionHeading.fontWeight};
      color: ${theme.colors.text};

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.sectionHeading.desktop.fontSize};
        line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
      }
    }

    > .sub {
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
      color: ${theme.colors.textSecondary};
    }
  }

  > .list {
    display: grid;
    grid-template-columns: 1fr;
    gap: ${theme.spacing.sm};

    @media (min-width: ${theme.breakpoints.lg}) {
      grid-template-columns: repeat(2, 1fr);
      gap: ${theme.spacing.lg};
      align-items: stretch;
    }

    > .cell {
      display: grid;
    }
  }

  > .empty,
  > .error {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  > .error {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.sm};

    > .retry {
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.surface};
      color: ${theme.colors.primary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
      cursor: pointer;

      &:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
      }
    }
  }
`,
);
