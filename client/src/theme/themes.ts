import { argamanVeZahavColors } from './colors/argamanVeZahav';
import type { Theme } from './models';
import { BREAKPOINTS, RADII, SHADOWS, SPACING, TYPOGRAPHY } from './tokens';

const sharedTokens = {
  typography: TYPOGRAPHY,
  spacing: SPACING,
  radii: RADII,
  shadows: SHADOWS,
  breakpoints: BREAKPOINTS,
};

export const ARGAMAN_VE_ZAHAV_THEME: Theme = { ...sharedTokens, colors: argamanVeZahavColors };
