import { css } from 'styled-components';

export const TeacherSection = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  padding-block: ${theme.spacing.lg};
  border-block-end: 1px solid ${theme.colors.border};

  > .heading {
    font-size: ${theme.typography.sectionHeading.phone.fontSize};
    line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    font-weight: ${theme.typography.sectionHeading.fontWeight};
    color: ${theme.colors.text};
  }

  > .bio {
    color: ${theme.colors.text};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  > .link {
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    min-block-size: 48px;
    display: flex;
    align-items: center;
  }
`,
);
