import { css } from 'styled-components';

// design-system.md, "Buttons and text links": fill primary, radius md,
// label 17/26 weight 600 on textOnPrimary, 11 block and 24 inline padding
// for a 48px target.
export const PrimaryButton = css(
  ({ theme }) => `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-block-size: 48px;
  padding-block: 11px;
  padding-inline: ${theme.spacing.xl};
  border: none;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.primary};
  color: ${theme.colors.textOnPrimary};
  font-weight: ${theme.typography.fontWeight.semiBold};
  font-size: ${theme.typography.body.phone.fontSize};
  line-height: ${theme.typography.body.phone.lineHeight};
  text-decoration: none;
  cursor: pointer;

  &:hover,
  &:active {
    background: ${theme.colors.primaryStrong};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }
`,
);
