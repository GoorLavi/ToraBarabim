import { css } from 'styled-components';

import * as consts from './consts';

// The gradient's three `<stop>` elements read the custom properties the
// ancestor `DedicationUnit` assigns per variant; the ornament itself never
// branches on variant. `.mirrored` is the unit's lower ornament, the same
// artwork flipped, never a second path.
export const Ornament = css`
  display: block;
  inline-size: 100%;
  block-size: auto;
  flex-shrink: 0;

  > defs > linearGradient {
    > .stop0 {
      stop-color: var(--dedication-ornament-stop-0);
    }

    > .stop40 {
      stop-color: var(--dedication-ornament-stop-40);
    }

    > .stop100 {
      stop-color: var(--dedication-ornament-stop-100);
    }
  }

  &.mirrored {
    transform: scaleY(-1);
  }
`;

// The unit is 280 wide at every placement and every width, with no
// responsive step, so nothing here reads a breakpoint (design-system.md,
// dedication geometry). Height is never set: it is the natural sum of its
// content, 314.2 unwrapped and 374.2 when the name line wraps, and the
// caller measures it rather than this component asserting it.
//
// Both variant blocks below assign nothing but `--dedication-*` custom
// property values: every rule that reads one lives outside them, so a
// variant can only ever change colour, never geometry.
export const DedicationUnit = css(
  ({ theme }) => `
  inline-size: ${consts.DEDICATION_UNIT_WIDTH_PX}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${theme.spacing.lg};

  &.onPrimary {
    --dedication-text: ${consts.VARIANT_TOKENS.onPrimary.text};
    --dedication-closing-text: ${consts.VARIANT_TOKENS.onPrimary.closingText};
    --dedication-shadow: ${consts.VARIANT_TOKENS.onPrimary.shadow};
    --dedication-ornament-stop-0: ${consts.VARIANT_TOKENS.onPrimary.ornamentStop0};
    --dedication-ornament-stop-40: ${consts.VARIANT_TOKENS.onPrimary.ornamentStop40};
    --dedication-ornament-stop-100: ${consts.VARIANT_TOKENS.onPrimary.ornamentStop100};
  }

  &.onPage {
    --dedication-text: ${consts.VARIANT_TOKENS.onPage.text};
    --dedication-closing-text: ${consts.VARIANT_TOKENS.onPage.closingText};
    --dedication-shadow: ${consts.VARIANT_TOKENS.onPage.shadow};
    --dedication-ornament-stop-0: ${consts.VARIANT_TOKENS.onPage.ornamentStop0};
    --dedication-ornament-stop-40: ${consts.VARIANT_TOKENS.onPage.ornamentStop40};
    --dedication-ornament-stop-100: ${consts.VARIANT_TOKENS.onPage.ornamentStop100};
  }

  > .text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.xs};
    inline-size: 100%;

    > .formula,
    > .name,
    > .parent,
    > .closing,
    > .donorCredit {
      inline-size: 100%;
      color: var(--dedication-text);
      text-shadow: var(--dedication-shadow);
    }

    > .formula {
      font-family: ${theme.typography.dedicationFormula.fontFamily};
      font-size: ${theme.typography.dedicationFormula.fontSize};
      line-height: ${theme.typography.dedicationFormula.lineHeight};
      font-weight: ${theme.typography.dedicationFormula.fontWeight};
      letter-spacing: ${theme.typography.dedicationFormula.letterSpacing};
    }

    > .name {
      font-family: ${theme.typography.dedicationName.fontFamily};
      font-size: ${theme.typography.dedicationName.fontSize};
      line-height: ${theme.typography.dedicationName.lineHeight};
      font-weight: ${theme.typography.dedicationName.fontWeight};
    }

    > .parent {
      font-family: ${theme.typography.dedicationParent.fontFamily};
      font-size: ${theme.typography.dedicationParent.fontSize};
      line-height: ${theme.typography.dedicationParent.lineHeight};
      font-weight: ${theme.typography.dedicationParent.fontWeight};
    }

    > .closing {
      color: var(--dedication-closing-text);
      font-family: ${theme.typography.dedicationClosing.fontFamily};
      font-size: ${theme.typography.dedicationClosing.fontSize};
      line-height: ${theme.typography.dedicationClosing.lineHeight};
      font-weight: ${theme.typography.dedicationClosing.fontWeight};
      letter-spacing: ${theme.typography.dedicationClosing.letterSpacing};
    }

    /* A donor credit at the same weight as the honoree's own name would
       invert what this surface is for: the dedication is about the person,
       not the payer. It takes the closing role, not the parent role, so it
       reads unmistakably as a footnote rather than competing with the
       52px name; and the same muted colour the closing line steps back to,
       since it is an attribution attached to the dedication, not a fifth
       line of it. On the plum field both colour tokens already resolve to
       the same gold, so this is a size-only change there. */
    > .donorCredit {
      color: var(--dedication-closing-text);
      font-family: ${theme.typography.dedicationClosing.fontFamily};
      font-size: ${theme.typography.dedicationClosing.fontSize};
      line-height: ${theme.typography.dedicationClosing.lineHeight};
      font-weight: ${theme.typography.dedicationClosing.fontWeight};
      letter-spacing: ${theme.typography.dedicationClosing.letterSpacing};
      /* 12 above it, not the 4 between every other line: it is an
         attribution attached to the dedication, not a sixth line of it, so
         it needs to read as attached but separate. The flex column's own
         4px gap already applies before this; the extra margin brings the
         total to 12. */
      margin-block-start: ${theme.spacing.sm};
    }
  }
`,
);
