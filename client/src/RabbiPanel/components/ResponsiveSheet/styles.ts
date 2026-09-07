import { css } from 'styled-components';

// Bottom sheet on a phone, centred dialog from `md` (768) up, per the
// design doc's cancel/move/delete confirmations (section 3, "גיליון תחתון
// בטלפון, דיאלוג ממורכז מ-md ומעלה"). Shared by every confirm/edit sheet
// in the rabbi panel rather than each screen re-deriving the same
// responsive overlay shell.
export const ResponsiveSheet = css(
  ({ theme }) => `
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(32, 27, 29, 0.45);

  @media (min-width: ${theme.breakpoints.md}) {
    align-items: center;
    padding: ${theme.spacing.lg};
  }

  > .panel {
    inline-size: 100%;
    max-inline-size: 480px;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.xl} ${theme.spacing.lg};
    border-radius: ${theme.radii.lg} ${theme.radii.lg} 0 0;
    background: ${theme.colors.surface};
    box-shadow: ${theme.shadows.raised};
    max-block-size: 90vh;
    overflow-y: auto;

    @media (min-width: ${theme.breakpoints.md}) {
      border-radius: ${theme.radii.lg};
    }
  }
`,
);
