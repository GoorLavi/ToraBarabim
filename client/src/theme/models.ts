// Thirteen color tokens (design-system.md, "The theme and the token contract"),
// plus three added for the lesson page's ticket card (LessonPage/components/
// LessonTicket): translucent white overlays for content sitting directly on
// a `primary` field, where a flat `textSecondary` or `border` would not read
// against the dark background.
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
  // White at 76% opacity, about 7.8:1 against `primary`: secondary text
  // (caption, address, duration) on the ticket's ארגמן field.
  textOnPrimaryMuted: string;
  border: string;
  // White at 30% opacity: hairlines and the ticket's perforation line on a
  // `primary` field.
  borderOnPrimary: string;
  // White at 12% opacity: a tag or pill fill on a `primary` field.
  surfaceOnPrimary: string;
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
  // The lesson page's ticket card (LessonPage/components/LessonTicket): the
  // day number and start time, its two hero numerals. Desktop is 36/40
  // because the rotated ticket there shares the card with more content and
  // no longer carries it alone; phone has no sibling in the shared scale
  // large enough to read as the card's single dominant number, so this is
  // its own role rather than a reuse of `pageHeading`.
  ticketTime: ThemeTypeRole;
  // The ticket's date-of-month numeral, beside `ticketTime`. It does not
  // step down on desktop like `ticketTime` does: the date stays the card's
  // largest numeral at every width.
  ticketDate: ThemeTypeRole;
  // The venue name in the ticket's body. One step above `cardTitle` on
  // desktop, where the ticket has room the card grid does not.
  ticketVenue: ThemeTypeRole;
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
