import { css } from 'styled-components';

// The text-link role (00-shared-shell.md, "Buttons and text links"): the
// 48px target comes from padding-block on the anchor, never a bigger font.
export const BackLink = css(
  ({ theme }) => `
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding-block: 13px;
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
    inline-size: 7px;
    block-size: 12px;
    flex-shrink: 0;
  }
`,
);
