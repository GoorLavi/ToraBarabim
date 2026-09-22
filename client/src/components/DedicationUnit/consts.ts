import { ARGAMAN_VE_ZAHAV_THEME } from '~/theme/themes';

import type { DedicationVariant, DedicationVariantTokens } from './models';

// The unit is 280 wide at every placement and every width: one width, no
// responsive step (design-system.md, dedication geometry). The one place
// this number is typed; the band that lays units out reads it too.
export const DEDICATION_UNIT_WIDTH_PX = 280;

// The site ships exactly one colour scheme (design-system.md, "The theme
// and the token contract"), so the concrete theme is read directly rather
// than through a styled-components render prop: `VARIANT_TOKENS` has to be
// a plain object (not a function of `theme`) for the excess-property check
// described on `DedicationVariantTokens` to catch a stray layout key.
const { colors, shadows } = ARGAMAN_VE_ZAHAV_THEME;

// `onPrimary` uses `accentOnDark` on every line, so the dark variant adds no
// colour value of its own. `onPage` uses `dedication` on the formula, name
// and parent lines, and the quieter `dedicationMuted` on the closing line
// only (design-system.md, dedication colour rules).
export const VARIANT_TOKENS: Record<DedicationVariant, DedicationVariantTokens> = {
  onPrimary: {
    text: colors.accentOnDark,
    closingText: colors.accentOnDark,
    shadow: shadows.dedicationOnPrimary,
    ornamentStop0: '#FBEECB',
    ornamentStop40: '#E8C26A',
    ornamentStop100: '#B8862B',
  },
  onPage: {
    text: colors.dedication,
    closingText: colors.dedicationMuted,
    shadow: shadows.dedicationOnPage,
    // `#9F7325` is the exact sRGB interpolation of the previous two-stop
    // light ramp at 40%, so adding the middle stop here is a visual no-op
    // by construction (design-system.md, dedication ornament gradient).
    ornamentStop0: '#B58329',
    ornamentStop40: '#9F7325',
    ornamentStop100: '#7E5C1E',
  },
};

// The ornament's own intrinsic size, set as SVG attributes so it reserves
// its box before the artwork paints (design-system.md: "Give it an explicit
// viewBox so it reserves its space").
export const ORNAMENT_VIEWBOX_WIDTH = 248;
export const ORNAMENT_VIEWBOX_HEIGHT = 53;

// Hand-traced from the owner's reference art (a symmetric sprig: a tall
// centre leaf, two fanned side leaves, two small flanking leaves, and a
// vine trailing to each edge). Symmetric about x=124, so the whole ornament
// is one component mirrored with `scaleY(-1)` for the unit's lower edge,
// never redrawn.
export const ORNAMENT_LEAF_PATHS = [
  'M124,3 C131,11 134,23 124,34 C114,23 117,11 124,3 Z',
  'M94,9 C104,10 118,18 124,32 C110,27 98,20 94,9 Z',
  'M154,9 C144,10 130,18 124,32 C138,27 150,20 154,9 Z',
  'M100,44 C108,40 118,38 124,36 C116,42 108,46 100,44 Z',
  'M148,44 C140,40 130,38 124,36 C132,42 140,46 148,44 Z',
] as const;

export const ORNAMENT_VINE_PATHS = [
  'M108,34 C86,40 60,28 34,33 C20,35 12,30 8,22 C4,15 8,9 15,10 C19,11 18,15 14,15',
  'M140,34 C162,40 188,28 214,33 C228,35 236,30 240,22 C244,15 240,9 233,10 C229,11 230,15 234,15',
] as const;
