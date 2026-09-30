import { css } from 'styled-components';

// The plum panel with a gold rule (design brief A, item 13): designed as a
// real terminal state, never a greyed-out card. Rendered twice by
// CoursePage.tsx (near the heading on phone, inside the side card on
// desktop, per item 15); this block is shared, only the outer `radius`
// differs by where each instance sits (styles there set it).
export const ClosedPanel = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.primary};
  text-align: center;

  > .rule {
    inline-size: 40px;
    block-size: 2px;
    background: ${theme.colors.accentOnDark};
  }

  > .heading {
    color: ${theme.colors.textOnPrimary};
    font-size: ${theme.typography.sectionHeading.desktop.fontSize};
    line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
    font-weight: ${theme.typography.sectionHeading.fontWeight};
  }

  > .factLine {
    color: ${theme.colors.textOnPrimaryMuted};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .link {
    display: flex;
    align-items: center;
    justify-content: center;
    min-block-size: 48px;
    inline-size: 100%;
    padding-inline: ${theme.spacing.lg};
    border: 1px solid ${theme.colors.borderOnPrimary};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.surfaceOnPrimary};
    color: ${theme.colors.textOnPrimary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
    text-decoration: none;
  }
`,
);
