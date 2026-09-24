import { css } from 'styled-components';

export const TeacherSection = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  padding-block: ${theme.spacing.lg};
  border-block-end: 1px solid ${theme.colors.border};

  > .heading {
    font-size: ${theme.typography.sectionHeading.phone.fontSize};
    line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    font-weight: ${theme.typography.sectionHeading.fontWeight};
    color: ${theme.colors.text};

    @media (min-width: ${theme.breakpoints.md}) {
      font-size: ${theme.typography.sectionHeading.desktop.fontSize};
      line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
    }
  }

  > .row {
    display: flex;
    gap: ${theme.spacing.lg};

    > .portrait {
      flex: 0 0 auto;
      inline-size: 132px;
      block-size: 176px;
      border-radius: ${theme.radii.md};
      object-fit: cover;
      background: ${theme.colors.primarySoft};
    }

    > .text {
      min-inline-size: 0;
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xs};

      > .name {
        color: ${theme.colors.text};
        font-size: ${theme.typography.cardTitle.phone.fontSize};
        line-height: ${theme.typography.cardTitle.phone.lineHeight};
        font-weight: ${theme.typography.cardTitle.fontWeight};
      }

      > .title {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .bio {
        color: ${theme.colors.text};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }

      > .link {
        display: inline-flex;
        align-items: center;
        gap: ${theme.spacing.xs};
        min-block-size: 48px;
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};

        > .chevron {
          inline-size: 18px;
          block-size: 18px;
        }
      }
    }
  }
`,
);
