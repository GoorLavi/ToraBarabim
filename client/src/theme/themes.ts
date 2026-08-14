import { evenVeTcheletColors } from './colors/evenVeTchelet';
import { evenVeZayitColors } from './colors/evenVeZayit';
import { argamanVeZahavColors } from './colors/argamanVeZahav';
import type { Theme, ThemeName } from './models';
import { BREAKPOINTS, RADII, SHADOWS, SPACING, TYPOGRAPHY } from './tokens';

const sharedTokens = {
  typography: TYPOGRAPHY,
  spacing: SPACING,
  radii: RADII,
  shadows: SHADOWS,
  breakpoints: BREAKPOINTS,
};

// Three color themes shipping together so they can be compared in the
// running app (design-system.md, "Themes and the token contract").
export const THEMES: Record<ThemeName, Theme> = {
  'ארגמן וזהב': { ...sharedTokens, colors: argamanVeZahavColors },
  'אבן וזית': { ...sharedTokens, colors: evenVeZayitColors },
  'אבן ותכלת': { ...sharedTokens, colors: evenVeTcheletColors },
};
