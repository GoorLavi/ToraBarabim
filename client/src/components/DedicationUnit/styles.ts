import { css } from 'styled-components';
import type { DefaultTheme } from 'styled-components';

import * as consts from './consts';

// The gradient's three `<stop>` elements read the custom properties the
// ancestor `DedicationUnit` assigns per variant; the ornament itself never
// branches on variant. `.mirrored` is the unit's lower ornament, the same
// artwork flipped, never a second path.
export const Ornament = css`
  display: block;
  /* Scaled independently of the unit's own fixed width (design-system.md,
     dedication geometry: the unit width is settled separately and does not
     scale), so this is an explicit length, never the 100% that used to
     just mirror the parent. block-size stays auto, derived from this via
     the SVG's own width/height attributes (Ornament.tsx), never set
     directly. */
  inline-size: max(${consts.DEDICATION_ORNAMENT_WIDTH_FLOOR_PX}px, calc(${consts.DEDICATION_ORNAMENT_WIDTH_REFERENCE} * var(--dedication-scale-px, 1px)));
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

// Declares --dedication-scale-px, the one custom property every scaled value
// below (and the band's own padding-block) reads. A length, not a unitless
// ratio: every reference value it is multiplied against is written as a
// bare, unitless number, since a length times a length is an area, not a
// length. Applied on the unit itself, so a unit renders at site scale
// wherever it is placed (the admin preview has no band around it), and on
// the band root, whose own padding-block reads the same property: both
// elements emit this one fragment, never their own copy of the numbers.
// Selected by the md width query, never a continuous function of the
// viewport. The numbers, and how they were worked out, live in consts.ts.
export const dedicationScaleCss = (theme: DefaultTheme): string => `
  --dedication-scale-px: ${consts.DEDICATION_SCALE_BELOW_MD}px;

  @media (min-width: ${theme.breakpoints.md}) {
    --dedication-scale-px: ${consts.DEDICATION_SCALE_FROM_MD}px;
  }
`;

// The unit is a fixed width at every placement and every width, with no
// responsive step in its geometry (design-system.md, dedication geometry);
// the only breakpoint read is the scale's own, inside dedicationScaleCss
// above. Height is never set directly: it is the natural sum of its
// content, which scales with --dedication-scale-px, and the caller measures
// it rather than this component asserting a figure.
//
// Both variant blocks below assign nothing but `--dedication-*` custom
// property values: every rule that reads one lives outside them, so a
// variant can only ever change colour, never geometry.
export const DedicationUnit = css(
  ({ theme }) => `
  ${dedicationScaleCss(theme)}
  inline-size: ${consts.DEDICATION_UNIT_WIDTH_PX}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${consts.scaledCss(consts.DEDICATION_ORNAMENT_TO_TEXT_GAP_REFERENCE, consts.DEDICATION_ORNAMENT_TO_TEXT_GAP_FLOOR_PX)};
  /* Named so the style queries below can target this ancestor by name
     rather than "the nearest one", the way the text element's own selector
     already names its own element. Style queries need no size containment,
     only a container to query, which any element already is. */
  container-name: dedication-unit;
  /* Read by the style queries in the onPage block below, which is why
     these live here, on the query container itself, rather than on the
     text element where they are also consumed: a container style query
     reads a custom property as computed on the container element, never
     on one of its descendants. */
  --dedication-formula-size: ${consts.scaledCss(consts.DEDICATION_FORMULA_SIZE_REFERENCE, consts.DEDICATION_FORMULA_SIZE_FLOOR_PX)};
  --dedication-parent-size: ${consts.scaledCss(consts.DEDICATION_PARENT_SIZE_REFERENCE, consts.DEDICATION_PARENT_SIZE_FLOOR_PX)};

  &.onPrimary {
    --dedication-text: ${consts.VARIANT_TOKENS.onPrimary.text};
    --dedication-closing-text: ${consts.VARIANT_TOKENS.onPrimary.closingText};
    --dedication-shadow: ${consts.VARIANT_TOKENS.onPrimary.shadow};
    ${consts.ornamentColorVarsCss(consts.VARIANT_TOKENS.onPrimary)}
  }

  &.onPage {
    --dedication-text: ${consts.VARIANT_TOKENS.onPage.text};
    --dedication-closing-text: ${consts.VARIANT_TOKENS.onPage.closingText};
    --dedication-shadow: ${consts.VARIANT_TOKENS.onPage.shadow};
    ${consts.ornamentColorVarsCss(consts.VARIANT_TOKENS.onPage)}

    /* Page-field contrast, driven off each line's own computed size, never
       a breakpoint: color.dedication (the default --dedication-text just
       above) clears 4.5:1 at every size the name ever reaches (its own
       floor is 24), but once the formula or the parent line has shrunk
       all the way to its own 14px floor, only the darker (despite the
       name) color.dedicationMuted still clears it against the page field.
       The plum field needs none of this: onPrimary uses accentOnDark on
       every line regardless of size, already. Tested for exact equality
       with the floor length, not a numeric threshold: the broadly
       supported form of a container style query is equality, and a
       numeric range comparison has materially narrower engine support.
       This equality can only ever match a custom property's own resolved
       value, never the raw max()/calc() formula text it is set to below,
       which is why --dedication-formula-size and --dedication-parent-size
       are registered as typed lengths in GlobalStyle.ts's own @property
       block: without that registration this comparison never matches at
       any scale (client/src/components/DedicationUnit/DedicationUnit.stories.tsx,
       PageFieldContrastSwitchesAtSiteScale, caught exactly that). */
    @container dedication-unit style(--dedication-formula-size: ${consts.DEDICATION_FORMULA_SIZE_FLOOR_PX}px) {
      > .text > .formula {
        color: var(--dedication-closing-text);
      }
    }

    @container dedication-unit style(--dedication-parent-size: ${consts.DEDICATION_PARENT_SIZE_FLOOR_PX}px) {
      > .text > .parent {
        color: var(--dedication-closing-text);
      }
    }
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
      /* A long name wraps into two even lines instead of one orphan word on
         the second. */
      text-wrap: balance;
    }

    > .formula {
      font-family: ${theme.typography.dedicationFormula.fontFamily};
      font-size: var(--dedication-formula-size);
      line-height: ${theme.typography.dedicationFormula.lineHeight};
      font-weight: ${theme.typography.dedicationFormula.fontWeight};
      letter-spacing: ${theme.typography.dedicationFormula.letterSpacing};
    }

    > .name {
      font-family: ${theme.typography.dedicationName.fontFamily};
      font-size: ${consts.scaledCss(consts.DEDICATION_NAME_SIZE_REFERENCE, consts.DEDICATION_NAME_SIZE_FLOOR_PX)};
      line-height: ${theme.typography.dedicationName.lineHeight};
      font-weight: ${theme.typography.dedicationName.fontWeight};
    }

    > .parent {
      font-family: ${theme.typography.dedicationParent.fontFamily};
      font-size: var(--dedication-parent-size);
      line-height: ${theme.typography.dedicationParent.lineHeight};
      font-weight: ${theme.typography.dedicationParent.fontWeight};
    }

    > .closing {
      color: var(--dedication-closing-text);
      font-family: ${theme.typography.dedicationClosing.fontFamily};
      font-size: ${consts.scaledCss(consts.DEDICATION_CLOSING_SIZE_REFERENCE, consts.DEDICATION_CLOSING_SIZE_FLOOR_PX)};
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
      font-size: ${consts.scaledCss(consts.DEDICATION_CLOSING_SIZE_REFERENCE, consts.DEDICATION_CLOSING_SIZE_FLOOR_PX)};
      line-height: ${theme.typography.dedicationClosing.lineHeight};
      font-weight: ${theme.typography.dedicationClosing.fontWeight};
      letter-spacing: ${theme.typography.dedicationClosing.letterSpacing};
      /* 12 above it, not the 4 between every other line: it is an
         attribution attached to the dedication, not a sixth line of it, so
         it needs to read as attached but separate. The flex column's own
         4px gap already applies before this; the extra margin brings the
         total to 12 at scale 1, and stays proportionate at every other
         scale the same way. */
      margin-block-start: ${consts.scaledCss(consts.DEDICATION_DONOR_MARGIN_TOP_REFERENCE, consts.DEDICATION_DONOR_MARGIN_TOP_FLOOR_PX)};
    }
  }
`,
);
