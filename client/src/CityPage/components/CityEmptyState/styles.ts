import { css } from 'styled-components';

export const CityEmptyState = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`,
);
