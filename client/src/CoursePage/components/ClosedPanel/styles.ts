import { css } from 'styled-components';

// The plum panel with a gold rule spec section 13 describes for the closed
// state: designed as a real terminal state, never a greyed-out card.
export const ClosedPanel = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.primary};
  text-align: center;

  > .rule {
    inline-size: 48px;
    block-size: 2px;
    background: ${theme.colors.accentOnDark};
  }

  > .heading {
    color: ${theme.colors.textOnPrimary};
    font-size: ${theme.typography.pageHeading.phone.fontSize};
    line-height: ${theme.typography.pageHeading.phone.lineHeight};
    font-weight: ${theme.typography.pageHeading.fontWeight};
  }

  > .factLine {
    color: ${theme.colors.textOnPrimaryMuted};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  > .link {
    display: flex;
    align-items: center;
    min-block-size: 48px;
    padding-inline: ${theme.spacing.lg};
    border: 1px solid ${theme.colors.borderOnPrimary};
    border-radius: ${theme.radii.pill};
    color: ${theme.colors.textOnPrimary};
    font-weight: ${theme.typography.fontWeight.semiBold};
  }
`,
);
