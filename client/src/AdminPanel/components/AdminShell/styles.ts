import { css } from 'styled-components';

export const AdminShell = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  min-block-size: 100%;

  > .header {
    background: ${theme.colors.primary};
    padding-block: ${theme.spacing.md};

    > .bar {
      max-inline-size: 1120px;
      margin-inline: auto;
      padding-inline: ${theme.spacing.lg};
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: ${theme.spacing.md};

      @media (min-width: ${theme.breakpoints.md}) {
        padding-inline: ${theme.spacing.xl};
        flex-wrap: nowrap;
      }

      > .brand {
        display: flex;
        align-items: center;
        gap: ${theme.spacing.sm};

        > .wordmark {
          color: ${theme.colors.textOnPrimary};
          font-weight: ${theme.typography.fontWeight.bold};
          font-size: ${theme.typography.sectionHeading.phone.fontSize};
          line-height: ${theme.typography.sectionHeading.phone.lineHeight};
        }

        > .badge {
          padding-block: ${theme.spacing.xs};
          padding-inline: ${theme.spacing.sm};
          border-radius: ${theme.radii.pill};
          background: ${theme.colors.accentOnDark};
          color: ${theme.colors.primaryStrong};
          font-weight: ${theme.typography.fontWeight.semiBold};
          font-size: ${theme.typography.tagAndCaption.phone.fontSize};
          line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
        }
      }

      > .nav {
        display: flex;
        gap: ${theme.spacing.sm};
        order: 3;
        flex-basis: 100%;

        @media (min-width: ${theme.breakpoints.md}) {
          order: 0;
          flex-basis: auto;
          margin-inline-end: auto;
        }

        > .tab {
          display: flex;
          align-items: center;
          min-block-size: 48px;
          padding-inline: ${theme.spacing.lg};
          border-radius: ${theme.radii.pill};
          color: ${theme.colors.textOnPrimary};
          font-weight: ${theme.typography.fontWeight.semiBold};
          font-size: ${theme.typography.body.phone.fontSize};
          line-height: ${theme.typography.body.phone.lineHeight};

          &.active {
            background: ${theme.colors.surface};
            color: ${theme.colors.primary};
          }
        }
      }

      > .account {
        display: flex;
        align-items: center;
        gap: ${theme.spacing.md};
        margin-inline-start: auto;

        @media (min-width: ${theme.breakpoints.md}) {
          margin-inline-start: 0;
        }

        > .name {
          color: ${theme.colors.textOnPrimary};
          font-size: ${theme.typography.secondary.phone.fontSize};
          line-height: ${theme.typography.secondary.phone.lineHeight};
        }

        > .logout {
          display: flex;
          align-items: center;
          min-block-size: 48px;
          padding-inline: ${theme.spacing.md};
          border-radius: ${theme.radii.pill};
          border: 1px solid ${theme.colors.textOnPrimary};
          color: ${theme.colors.textOnPrimary};
          font-weight: ${theme.typography.fontWeight.semiBold};
          font-size: ${theme.typography.secondary.phone.fontSize};
          line-height: ${theme.typography.secondary.phone.lineHeight};
        }
      }
    }
  }

  > .content {
    flex: 1;
    max-inline-size: 1120px;
    inline-size: 100%;
    margin-inline: auto;
    padding-inline: ${theme.spacing.lg};
    padding-block: ${theme.spacing.xl};

    @media (min-width: ${theme.breakpoints.md}) {
      padding-inline: ${theme.spacing.xl};
    }
  }
`,
);
