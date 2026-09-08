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

    > .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: ${theme.spacing.md};

      /* Two columns reads fine on a phone, per the measured frame, but a
         608px-wide poster on a wide screen is a defect a screenshot caught,
         not a smaller card stretched large: step like every other lesson
         grid instead of holding this fixed at two (design-system.md,
         "The lesson grid steps"). */
      @media (min-width: ${theme.breakpoints.md}) {
        grid-template-columns: repeat(3, 1fr);
        gap: ${theme.spacing.lg};
      }

      @media (min-width: ${theme.breakpoints.xl}) {
        grid-template-columns: repeat(4, 1fr);
      }

      > .cell {
        display: grid;
      }
    }
  }
`,
);
