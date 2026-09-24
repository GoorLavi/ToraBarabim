import { css } from 'styled-components';

export const TeacherLine = css(
  ({ theme }) => `
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  min-block-size: 48px;

  > .avatar {
    flex: 0 0 auto;
    inline-size: 40px;
    block-size: 40px;
    border-radius: ${theme.radii.pill};
    object-fit: cover;
    background: ${theme.colors.primarySoft};
  }

  > .link {
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
    text-decoration: underline;
  }

  > .name {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }
`,
);
