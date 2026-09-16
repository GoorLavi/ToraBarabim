import { css } from 'styled-components';

export const RabbiEmptyLessons = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};

  > .nationwide {
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
  }
`,
);
