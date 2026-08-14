import type { ThemeBreakpoints, ThemeRadii, ThemeShadows, ThemeSpacing, ThemeTypography } from './models';

// Type, spacing, radii, shadows and breakpoints are shared by every theme:
// only color varies (design-system.md, "Themes and the token contract").
// Defined once here and spread into each theme in themes.ts.

// Assistant was drawn for Hebrew rather than derived from a Latin family, and
// stays readable at small sizes for an audience that spans a wide age range.
// Only 400/600/700 ship: the family's thin weights fail this audience.
export const TYPOGRAPHY: ThemeTypography = {
  fontFamily: "'Assistant', system-ui, -apple-system, Arial, sans-serif",
  fontWeight: {
    regular: 400,
    semiBold: 600,
    bold: 700,
  },
  pageHeading: {
    phone: { fontSize: '28px', lineHeight: '36px' },
    desktop: { fontSize: '40px', lineHeight: '48px' },
    fontWeight: 700,
  },
  sectionHeading: {
    phone: { fontSize: '20px', lineHeight: '28px' },
    desktop: { fontSize: '24px', lineHeight: '32px' },
    fontWeight: 700,
  },
  cardTitle: {
    phone: { fontSize: '18px', lineHeight: '26px' },
    desktop: { fontSize: '18px', lineHeight: '26px' },
    fontWeight: 600,
  },
  timeInCard: {
    phone: { fontSize: '20px', lineHeight: '24px' },
    desktop: { fontSize: '20px', lineHeight: '24px' },
    fontWeight: 600,
  },
  body: {
    phone: { fontSize: '17px', lineHeight: '26px' },
    desktop: { fontSize: '17px', lineHeight: '26px' },
    fontWeight: 400,
  },
  secondary: {
    phone: { fontSize: '15px', lineHeight: '22px' },
    desktop: { fontSize: '15px', lineHeight: '22px' },
    fontWeight: 400,
  },
  tagAndCaption: {
    phone: { fontSize: '14px', lineHeight: '20px' },
    desktop: { fontSize: '14px', lineHeight: '20px' },
    fontWeight: 600,
  },
  // Narrow-card floor, not a viewport-driven role: fixed regardless of
  // breakpoint, and applied only inside a lesson card in the two-column
  // phone grid (design-system.md, Type).
  cardTitleCompact: {
    phone: { fontSize: '15px', lineHeight: '21px' },
    desktop: { fontSize: '15px', lineHeight: '21px' },
    fontWeight: 600,
  },
  secondaryCompact: {
    phone: { fontSize: '14px', lineHeight: '20px' },
    desktop: { fontSize: '14px', lineHeight: '20px' },
    fontWeight: 400,
  },
};

export const SPACING: ThemeSpacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
  section: '64px',
};

export const RADII: ThemeRadii = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  pill: '999px',
};

// The shadow color is a near-black at low alpha and does not change per
// theme: a tinted shadow reads as a smudge (design-system.md, Shadows).
export const SHADOWS: ThemeShadows = {
  card: '0 1px 2px rgba(28,26,23,0.04), 0 1px 3px rgba(28,26,23,0.06)',
  raised: '0 4px 16px rgba(28,26,23,0.10)',
};

export const BREAKPOINTS: ThemeBreakpoints = {
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};
