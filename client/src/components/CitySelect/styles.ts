import { css } from 'styled-components';

export const CitySelect = css(
  ({ theme }) => `
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &.fullWidth {
    inline-size: 100%;
  }

  > .clear {
    min-block-size: 48px;
    padding-inline: ${theme.spacing.sm};
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        text-decoration: underline;
      }
    }

    &:focus-visible {
      text-decoration: underline;
    }
  }
`,
);
