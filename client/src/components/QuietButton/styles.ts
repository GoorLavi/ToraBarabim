import { css } from 'styled-components';

// design-system.md, "Buttons and text links": surface fill, 1px border,
// radius md, label 17/26 weight 600 in primary, 11 block and 24 inline
// padding for a 48px target.
export const QuietButton = css(
  ({ theme }) => `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-block-size: 48px;
  padding-block: 11px;
  padding-inline: ${theme.spacing.xl};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.surface};
  color: ${theme.colors.primary};
  font-weight: ${theme.typography.fontWeight.semiBold};
  font-size: ${theme.typography.body.phone.fontSize};
  line-height: ${theme.typography.body.phone.lineHeight};
  text-decoration: none;
  cursor: pointer;

  &:hover,
  &:active {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primaryStrong};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`,
);
