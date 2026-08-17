import { css } from 'styled-components';

export const RequireAdminSession = css(
  ({ theme }) => `
  display: flex;
  align-items: center;
  justify-content: center;
  min-block-size: 100vh;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.body.phone.fontSize};
  line-height: ${theme.typography.body.phone.lineHeight};
`,
);
