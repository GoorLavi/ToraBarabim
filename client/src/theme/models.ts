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
  // A dedication's text on the page field. Its `primary`-field counterpart
  // is `accentOnDark`, so the dark variant adds no color of its own.
  dedication: string;
  // A dedication's closing line on the page field, the one line that steps
  // back.
  dedicationMuted: string;
  // `text` at 45% opacity: the backdrop behind a `ResponsiveSheet`'s panel
  // and every sheet built on it (the date picker's mobile sheet, the city
  // picker's drawer). Alpha over the page rather than a flat color, so it
  // darkens whatever happens to be behind it.
  scrim: string;
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

// The four dedication roles (design-system.md, "The second family, and the
// dedication roles") are single-value at every width, so they have nothing
// for a `phone`/`desktop` split to respond to, and they carry a family and a
// tracking no role above needs. Forcing them into `ThemeTypeRole` by
// duplicating one value into both widths would claim a responsive step that
// does not exist.
export interface ThemeDedicationTypeRole {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  // Authored in `em`, never `%`, and present on exactly two of the four
  // roles. Absent (not `'0em'`) on the other two, so there is nothing here
  // for a later pass to "tidy" into consistency: doing that would space out
  // a person's name.
  letterSpacing?: string;
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
  // the card is roughly 171px wide (design-system.md, Type): "the card title
  // steps down to 15 / 21 with its supporting lines at 14 / 20. That is the
  // floor, not a licence to shrink further."
  cardTitleCompact: ThemeTypeRole;
  secondaryCompact: ThemeTypeRole;
  // The women's-area tile's own lesson count, inside its plum area. Numerically
  // equal to `ticketTime`'s desktop step, but a distinct role: design-system.md
  // reserves `ticketTime` for the lesson ticket's start time alone. Constant
  // at every tile width, unlike the responsive roles above.
  tileCount: ThemeTypeRole;
  // The opening formula line of a dedication ("לעילוי נשמת" and its two
  // siblings), in Assistant. Carries tracking: the one role of the four that
  // is a short fixed phrase rather than a person's name.
  dedicationFormula: ThemeDedicationTypeRole;
  // The honoured person's name, in Frank Ruhl Libre. No tracking: loosening
  // it would space out a name.
  dedicationName: ThemeDedicationTypeRole;
  // The parent particle line ("בן"/"בת" and the father's name), in Frank
  // Ruhl Libre. Also carries a name, so also no tracking. The donor credit
  // line reuses this role rather than getting one of its own.
  dedicationParent: ThemeDedicationTypeRole;
  // The closing line ("תנצב״ה"), in Assistant. Carries tracking: it is the
  // one line that steps back, and the wider tracking is part of that.
  dedicationClosing: ThemeDedicationTypeRole;
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
  // Lifts a dedication's gold text off the plum field. Not `raised`: that
  // separates a surface from the page, this gives depth to text on a field.
  dedicationOnPrimary: string;
  // The same job on the page field, where far less contrast is needed.
  dedicationOnPage: string;
}

export interface ThemeBreakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeLayout {
  // The site's one content band (design-system.md, "Breakpoints and content
  // width"): every page reads this rather than keeping its own copy.
  contentMaxWidth: string;
}

export interface ThemeZIndex {
  // Popovers anchored inside the header: the date picker's calendar and the
  // city picker, both from `sm` up.
  popover: number;
  // The sticky header band at `lg` and up, and the pinned bar (and its
  // expand panel) below `lg`.
  header: number;
  // The scrim and panel behind any `ResponsiveSheet`: above every popover
  // and the header itself, so a sheet always sits on top.
  sheetScrim: number;
}

export interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
  shadows: ThemeShadows;
  breakpoints: ThemeBreakpoints;
  layout: ThemeLayout;
  zIndex: ThemeZIndex;
}
