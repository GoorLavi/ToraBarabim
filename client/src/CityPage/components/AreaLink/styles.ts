import { css } from 'styled-components';

export const AreaLink = css(
  ({ theme }) => `
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: ${theme.spacing.sm};
  min-block-size: 48px;
  padding-inline-start: ${theme.spacing.sm};
  color: ${theme.colors.primary};
  font-weight: ${theme.typography.fontWeight.semiBold};
  font-size: ${theme.typography.secondary.phone.fontSize};
  line-height: ${theme.typography.secondary.phone.lineHeight};
  text-decoration: none;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${theme.colors.primaryStrong};
      text-decoration: underline;
    }
  }

  &:active {
    color: ${theme.colors.primaryStrong};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
    border-radius: ${theme.radii.sm};
  }

  > .chevron {
    inline-size: 12px;
    block-size: 12px;
    flex-shrink: 0;
  }
`,
);
