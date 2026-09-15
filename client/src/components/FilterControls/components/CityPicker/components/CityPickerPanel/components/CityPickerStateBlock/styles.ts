import { css } from 'styled-components';

export const CityPickerStateBlock = css(
  ({ theme }) => `
  padding-block: ${theme.spacing.xl};
  max-inline-size: 36ch;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  text-align: center;

  > .title {
    color: ${theme.colors.text};
    font-size: ${theme.typography.cardTitle.phone.fontSize};
    line-height: ${theme.typography.cardTitle.phone.lineHeight};
    font-weight: ${theme.typography.cardTitle.fontWeight};
  }

  &.danger > .title {
    color: ${theme.colors.danger};
  }

  > .body {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .actions {
    margin-block-start: ${theme.spacing.xs};
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};
  }
`,
);
