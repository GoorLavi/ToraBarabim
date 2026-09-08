import { argamanVeZahavColors } from './colors/argamanVeZahav';
import type { Theme } from './models';
import { BREAKPOINTS, LAYOUT, RADII, SHADOWS, SPACING, TYPOGRAPHY } from './tokens';

const sharedTokens = {
  typography: TYPOGRAPHY,
  spacing: SPACING,
  radii: RADII,
  shadows: SHADOWS,
  breakpoints: BREAKPOINTS,
  layout: LAYOUT,
};

export const ARGAMAN_VE_ZAHAV_THEME: Theme = { ...sharedTokens, colors: argamanVeZahavColors };
