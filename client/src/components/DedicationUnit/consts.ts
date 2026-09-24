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
// viewBox so it reserves its space"). Authored at 240 by 56 (the designer's
// export), but the drawn path only ever occupied y 0.56 to 52.52 inside
// that: 1.45% of every ornament's own height was empty by construction.
// Recropped to exactly the path's own bounding box, never touching the
// path itself, so the artwork is identical and the block-size this
// reserves (`styles.ts`: `block-size: auto`, derived from this ratio, never
// set directly) is finally the artwork's real height.
export const ORNAMENT_VIEWBOX_WIDTH = 240;
export const ORNAMENT_VIEWBOX_MIN_Y = 0.56;
export const ORNAMENT_VIEWBOX_HEIGHT = 51.96;

// Every scaled value below is `max(floor, calc(reference * scale))`
// (design-system.md, dedication geometry: the band's own fold-driven
// scale). `--dedication-scale-px` (DedicationBand/styles.ts) is a length,
// not a unitless number, so every reference here is written as a bare,
// unitless number rather than a themed "24px" string: a length times a
// length is an area, not a length, so only a bare number times that scale
// produces a length again. Each one hand-mirrors the matching
// theme.typography or theme.spacing value in theme/tokens.ts, the
// canonical scale-1 reference design-system.md documents; a calc() cannot
// pull the bare number back out of that value's own "24px" string.
export const DEDICATION_FORMULA_SIZE_REFERENCE = 24;
export const DEDICATION_NAME_SIZE_REFERENCE = 52;
export const DEDICATION_PARENT_SIZE_REFERENCE = 32;
// Also the donor credit line's own reference: it reuses `dedicationClosing`
// (styles.ts), never a role of its own.
export const DEDICATION_CLOSING_SIZE_REFERENCE = 20;
export const DEDICATION_ORNAMENT_TO_TEXT_GAP_REFERENCE = 16;
export const DEDICATION_DONOR_MARGIN_TOP_REFERENCE = 8;
export const DEDICATION_ORNAMENT_WIDTH_REFERENCE = DEDICATION_UNIT_WIDTH_PX;

export const DEDICATION_FORMULA_SIZE_FLOOR_PX = 14;
export const DEDICATION_NAME_SIZE_FLOOR_PX = 24;
export const DEDICATION_PARENT_SIZE_FLOOR_PX = 14;
export const DEDICATION_CLOSING_SIZE_FLOOR_PX = 14;
export const DEDICATION_ORNAMENT_TO_TEXT_GAP_FLOOR_PX = 4;
export const DEDICATION_DONOR_MARGIN_TOP_FLOOR_PX = 4;
export const DEDICATION_ORNAMENT_WIDTH_FLOOR_PX = 120;

export const scaledCss = (referenceNumber: number, floorPx: number): string =>
  `max(${floorPx}px, calc(${referenceNumber} * var(--dedication-scale-px, 1px)))`;

// The ornament's own three gradient-stop custom properties, the colour
// fragment `Ornament.tsx`'s `<linearGradient>` reads (styles.ts). Exported
// so a caller outside this component's own two variant blocks below (the
// dedication window, HomePage/components/DedicationBand/components/
// DedicationWindow) can render the same `<Ornament />` with the same
// colours without retyping this three-line mapping a second time.
export const ornamentColorVarsCss = (tokens: DedicationVariantTokens): string => `
  --dedication-ornament-stop-0: ${tokens.ornamentStop0};
  --dedication-ornament-stop-40: ${tokens.ornamentStop40};
  --dedication-ornament-stop-100: ${tokens.ornamentStop100};
`;

// The owner's artwork, lifted off its background and vectorised, carried
// verbatim: one path, fill-rule nonzero, fill only, no stroke. Symmetric,
// so the whole ornament is one component mirrored with `scaleY(-1)` for the
// unit's lower edge, never redrawn.
export const ORNAMENT_PATH =
  'M116.638 50.8219C115.204 47.8454 112.118 45.0341 108.094 43.0498C99.4947 38.6951 96.8489 38.8054 92.2738 43.3805C88.1948 47.5146 84.5016 48.6722 79.0446 47.5146C77.2807 47.1288 77.2255 46.798 78.9343 46.1917C79.6509 45.9161 81.4699 44.7585 82.9582 43.6561C85.8245 41.4512 88.305 40.5142 91.1162 40.5142C92.8801 40.5142 96.3528 39.522 96.3528 39.0259C96.3528 38.9156 92.9352 38.0888 88.8011 37.2069C66.5871 32.5766 62.4529 32.6869 46.1369 38.1439C25.6316 44.9239 17.0877 45.861 9.09509 42.1678C1.10244 38.5298 -2.14974 27.9464 3.85852 25.025C4.63023 24.6391 5.62242 24.3635 6.06339 24.4737C6.8351 24.584 6.72485 24.7494 5.34681 25.3006C4.46486 25.6864 3.8034 26.1825 3.8034 26.403C3.85852 26.6235 3.58292 27.3952 3.19706 28.1118C0.551221 32.9074 3.85853 39.1912 10.3078 41.6166C17.9146 44.4278 25.0804 43.4907 43.6564 37.3171C57.9329 32.5766 60.3032 32.1357 68.0753 32.3562C76.6743 32.6869 87.0923 34.5059 99.1089 37.8683C108.865 40.6244 114.874 44.4278 117.023 49.3336C118.181 51.9244 117.795 53.2473 116.638 50.8219ZM122.425 51.759C123.969 43.3254 134.497 38.1439 158.254 33.9547C174.46 31.1435 179.201 31.5293 195.186 36.9313C209.022 41.5615 212.88 42.5537 218.999 42.9946C227.873 43.601 235.039 40.3488 237.189 34.7264C238.512 31.1986 236.693 25.9069 233.881 25.3006C232.503 24.9698 232.228 24.3635 233.496 24.3635C240 24.3635 241.323 33.5137 235.59 39.081C231.401 43.1049 226.936 44.4829 218.833 44.1522C212.219 43.8215 209.848 43.2703 196.674 39.0259C178.76 33.183 176.004 32.9074 161.782 35.2776C156.38 36.1595 146.899 38.0888 145.191 38.6951C143.151 39.3015 144.86 40.1283 148.994 40.5142C153.128 40.8449 154.341 41.341 157.373 43.7663C158.585 44.8137 160.404 45.9161 161.286 46.3019C162.885 46.9634 162.94 46.9634 162.003 47.3493C161.452 47.5697 159.522 47.7351 157.703 47.7351C153.349 47.7902 151.805 47.1288 148.057 43.5459C146.514 42.1127 144.75 40.7347 144.198 40.5142C138.797 38.4747 127.056 44.3727 123.418 50.8771C122.315 52.8614 122.205 52.9166 122.425 51.759ZM119.614 49.8849C119.559 48.3414 119.504 42.9946 119.449 38.0337L119.394 29.0488L117.795 24.3635C114.819 15.544 114.929 12.1265 118.401 3.63773C119.945 -0.165667 120.11 -0.27591 121.268 2.36993C124.961 10.6933 125.237 15.2133 122.425 23.9776C120.661 29.6552 120.717 29.2142 120.551 40.7898C120.441 46.9634 120.22 51.6488 120 52.0346C119.724 52.5307 119.614 51.9795 119.614 49.8849ZM116.748 41.2859C115.039 37.703 113.275 35.8288 110.684 34.8918C104.566 32.5766 101.755 30.482 98.8884 26.0723C97.9513 24.6391 95.8567 19.8435 96.0772 19.623C96.2425 19.4577 105.062 22.1586 106.109 22.6547C109.362 24.3635 112.393 28.2771 114.267 33.183C114.874 34.8366 116.031 37.6478 116.803 39.4669C118.457 43.4356 118.401 44.8137 116.748 41.2859ZM122.756 41.2859C122.866 40.6795 123.528 38.9708 124.244 37.4273C124.906 35.9391 125.788 33.7342 126.174 32.6318C127.552 28.2771 130.528 24.5289 134.111 22.765C135.434 22.0484 144.088 19.4577 144.309 19.6782C144.695 20.064 141.222 26.403 139.237 28.8835C137.088 31.5293 136.812 31.7498 133.284 33.2932C131.245 34.2303 128.875 35.2225 127.993 35.6083C126.229 36.4352 124.906 37.9786 123.748 40.6244C122.866 42.6088 122.425 42.8844 122.756 41.2859Z';
