// Thirteen color tokens, identical keys across every theme (design-system.md,
// "Themes and the token contract"). A token missing from one theme and
// present in another must be a type error, not a runtime surprise.
export interface ThemeColors {
  bg: string;
  surface: string;
  primary: string;
  primaryStrong: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  accentOnDark: string;
  text: string;
  textSecondary: string;
  textOnPrimary: string;
  border: string;
  danger: string;
}

export interface ThemeTypeSize {
  fontSize: string;
  lineHeight: string;
}

export interface ThemeTypeRole {
  phone: ThemeTypeSize;
  desktop: ThemeTypeSize;
  fontWeight: number;
}

export interface ThemeTypography {
  fontFamily: string;
  fontWeight: {
    regular: number;
    semiBold: number;
    bold: number;
  };
  pageHeading: ThemeTypeRole;
  sectionHeading: ThemeTypeRole;
  cardTitle: ThemeTypeRole;
  timeInCard: ThemeTypeRole;
  body: ThemeTypeRole;
  secondary: ThemeTypeRole;
  tagAndCaption: ThemeTypeRole;
  // The floor for a lesson-poster card in the two-column phone grid, where
  // the card is roughly 173px wide (design-system.md, Type): "the card title
  // steps down to 15 / 21 with its supporting lines at 14 / 20. That is the
  // floor, not a licence to shrink further."
  cardTitleCompact: ThemeTypeRole;
  secondaryCompact: ThemeTypeRole;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
  xxxl: string;
  section: string;
}

export interface ThemeRadii {
  sm: string;
  md: string;
  lg: string;
  pill: string;
}

export interface ThemeShadows {
  card: string;
  raised: string;
}

export interface ThemeBreakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
  shadows: ThemeShadows;
  breakpoints: ThemeBreakpoints;
}

export type ThemeName = 'ארגמן וזהב' | 'אבן וזית' | 'אבן ותכלת';
