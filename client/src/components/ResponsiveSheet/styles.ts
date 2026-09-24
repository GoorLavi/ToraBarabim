import { css } from 'styled-components';

// Bottom sheet on a phone, centred dialog from `md` (768) up, per the
// design doc's cancel/move/delete confirmations (section 3, "גיליון תחתון
// בטלפון, דיאלוג ממורכז מ-md ומעלה"). Shared by every confirm/edit sheet
// in the rabbi panel rather than each screen re-deriving the same
// responsive overlay shell.
//
// The scrim fade and phone panel slide-in were DateFilterChips's own, on
// its private copy of this shell. Moved here rather than kept as a second
// copy, since every sheet built on this shell should open the same way; the
// slide is phone-only because from `md` up this becomes a centred dialog,
// not a sheet rising off the edge.
export const ResponsiveSheet = css(
  ({ theme }) => `
  position: fixed;
  inset: 0;
  z-index: ${theme.zIndex.sheetScrim};
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: ${theme.colors.scrim};
  animation: responsiveSheetScrimIn 160ms ease-out;

  @media (min-width: ${theme.breakpoints.md}) {
    align-items: center;
    padding: ${theme.spacing.lg};
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
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
    animation: responsiveSheetPanelSlideIn 160ms ease-out;

    @media (min-width: ${theme.breakpoints.md}) {
      border-radius: ${theme.radii.lg};
      animation: none;
    }

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }

    /* Focus lands here programmatically on open (ResponsiveSheet.tsx), not
       through a keyboard Tab, so the browser's default focus ring (meant
       for a Tab arriving somewhere) reads as a stray outline around the
       whole sheet rather than a signal of anything. A real keyboard user
       tabbing to a control inside still gets that control's own
       focus-visible ring. */
    &:focus {
      outline: none;
    }
  }

  @keyframes responsiveSheetScrimIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes responsiveSheetPanelSlideIn {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
`,
);
