import type { LogoMarkVariant } from './models';

// Fixed brand colors, per decision 0014: the mark never reads the active theme's
// `primary`/`accent` tokens, so it stays recognizable across all three color themes.
export const COLORS: Record<LogoMarkVariant, { structure: string; arch: string }> = {
  default: { structure: '#6B2436', arch: '#B8862B' },
  onDark: { structure: '#FFFFFF', arch: '#E0B45E' },
};
