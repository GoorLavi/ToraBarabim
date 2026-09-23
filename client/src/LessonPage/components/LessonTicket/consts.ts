// The poster's fixed width on the ticket. On a phone it keeps its own 3:4
// ratio; on desktop it stretches to the card's own height instead (design
// spec, "The poster does not contribute to H"), so no ratio is set there.
export const POSTER_WIDTH_PHONE = '132px';
export const POSTER_WIDTH_DESKTOP = '285px';

// Half of this sits outside the ticket's own edge; `overflow: hidden` on the
// ticket clips that half, leaving the bite that reads as a punched notch.
export const NOTCH_DIAMETER = '16px';

// The perforation's rhythm (design spec): a 2px dash, a 6px gap, at 1px
// thickness. Drawn as a repeating gradient rather than `border-style: dashed`,
// which cannot hold a gap this precise across browsers.
export const PERFORATION_DASH = '2px';
export const PERFORATION_GAP = '6px';
export const PERFORATION_THICKNESS = '1px';

// The stub and body's own block padding on a phone: 24 inline
// (theme.spacing.xl) but 20 block, a value the shared spacing scale has no
// step for (frame measurement). Desktop steps this up to `xxl` (32), which
// is already on the scale.
export const PANEL_BLOCK_PADDING_PHONE = '20px';

// The stub's single-column layout at `lg`: a short rule between the date and
// the time, in place of the two-column layout's full-height vertical hairline.
export const STUB_DIVIDER_LENGTH_DESKTOP = '56px';

// The gap between the stub's date block, its short rule, and its time block
// on desktop (frame measurement, not on the shared spacing scale).
export const STUB_WHEN_ROW_GAP_DESKTOP = '20px';

// The text column's own inline padding on desktop (frame measurement, not on
// the shared spacing scale).
export const TEXT_COLUMN_INLINE_PADDING_DESKTOP = '28px';

// A gap the shared spacing scale has no step for, between two supporting
// lines that sit closer together than the scale's smallest step: the
// street line under the venue, and the rabbi's title under their name.
// Also reused for the audience tag's own vertical padding, the third place
// this exact measurement appears.
export const TICKET_FINE_GAP = '2px';

// The card's own floor height on desktop: shorter content never shrinks the
// card below this (design spec, "Height hugs content with a floor of 380").
export const CARD_MIN_BLOCK_SIZE_DESKTOP = '380px';

// Reaches the 48px tap-target floor for each linked rabbi name via
// padding-block, with an equal negative margin-block cancelling the added
// height so the ticket's own rhythm is unchanged (LOCKED PLAN, "reaching a
// real 48px target"). `cardTitle` and `tagAndCaption` are the same size at
// both breakpoints, so one value covers both.
export const NAME_LINK_BLOCK_PADDING = '11px'; // (48 - cardTitle's 26px line height) / 2
export const SUBSTITUTE_LINK_BLOCK_PADDING = '14px'; // (48 - tagAndCaption's 20px line height) / 2

// Reaches the same 48px tap-target floor for the venue name, when it links
// to the place page (LessonTicket.tsx, `venue.kind === 'place'`): ticketVenue
// is 18/26 on a phone and 20/28 on desktop, so the two breakpoints need
// their own padding rather than one shared value.
export const VENUE_LINK_BLOCK_PADDING_PHONE = '11px'; // (48 - 26px line height) / 2
export const VENUE_LINK_BLOCK_PADDING_DESKTOP = '10px'; // (48 - 28px line height) / 2

// With no poster the main panel has only text in it, so the card caps
// narrower on desktop rather than becoming a wide, mostly empty band
// (design spec, "No photo").
export const CARD_MAX_INLINE_SIZE_NO_POSTER_DESKTOP = '640px';

// Proper nouns, shown in Latin inside `dir="ltr"` spans rather than
// transliterated to Hebrew letters (there is no Hebrew name for either app).
export const WAZE_LABEL = 'Waze';
export const GOOGLE_MAPS_LABEL = 'Google Maps';

export const WAZE_ARIA_LABEL = 'פתיחה ב-Waze';
export const GOOGLE_MAPS_ARIA_LABEL = 'פתיחה ב-Google Maps';

export const NAV_ROW_HEADING_LABEL = 'ניווט לשיעור';

// Waze's brand mark, traced from simple-icons
// (https://github.com/simple-icons/simple-icons/blob/develop/icons/waze.svg): one path
// whose eyes and smile are cut from the cyan fill as sub-paths, not drawn as separate
// shapes on top of it.
export const WAZE_ICON_VIEW_BOX = '0 0 24 24';
export const WAZE_ICON_PATHS: ReadonlyArray<{ d: string; fill: string }> = [
  {
    d: 'M13.218 0C9.915 0 6.835 1.49 4.723 4.148c-1.515 1.913-2.31 4.272-2.31 6.706v1.739c0 .894-.62 1.738-1.862 1.813-.298.025-.547.224-.547.522-.05.82.82 2.31 2.012 3.502.82.844 1.788 1.515 2.832 2.036a3 3 0 0 0 2.955 3.528 2.966 2.966 0 0 0 2.931-2.385h2.509c.323 1.689 2.086 2.856 3.974 2.21 1.64-.546 2.36-2.409 1.763-3.924a12.84 12.84 0 0 0 1.838-1.465 10.73 10.73 0 0 0 3.18-7.65c0-2.882-1.118-5.589-3.155-7.625A10.899 10.899 0 0 0 13.218 0zm0 1.217c2.558 0 4.967.994 6.78 2.807a9.525 9.525 0 0 1 2.807 6.78A9.526 9.526 0 0 1 20 17.585a9.647 9.647 0 0 1-6.78 2.807h-2.46a3.008 3.008 0 0 0-2.93-2.41 3.03 3.03 0 0 0-2.534 1.367v.024a8.945 8.945 0 0 1-2.41-1.788c-.844-.844-1.316-1.614-1.515-2.11a2.858 2.858 0 0 0 1.441-.846 2.959 2.959 0 0 0 .795-2.036v-1.789c0-2.11.696-4.197 2.012-5.861 1.863-2.385 4.62-3.726 7.6-3.726zm-2.41 5.986a1.192 1.192 0 0 0-1.191 1.192 1.192 1.192 0 0 0 1.192 1.193A1.192 1.192 0 0 0 12 8.395a1.192 1.192 0 0 0-1.192-1.192zm7.204 0a1.192 1.192 0 0 0-1.192 1.192 1.192 1.192 0 0 0 1.192 1.193 1.192 1.192 0 0 0 1.192-1.193 1.192 1.192 0 0 0-1.192-1.192zm-7.377 4.769a.596.596 0 0 0-.546.845 4.813 4.813 0 0 0 4.346 2.757 4.77 4.77 0 0 0 4.347-2.757.596.596 0 0 0-.547-.845h-.025a.561.561 0 0 0-.521.348 3.59 3.59 0 0 1-3.254 2.061 3.591 3.591 0 0 1-3.254-2.061.64.64 0 0 0-.546-.348z',
    fill: '#05C3DD',
  },
];

// Google Maps' pin mark, traced from gilbarbara/logos
// (https://github.com/gilbarbara/logos/blob/main/logos/google-maps.svg): five paths in
// Google's own brand colors forming one continuous teardrop silhouette, the colors
// split diagonally rather than into quarters of a disc.
export const GOOGLE_MAPS_ICON_VIEW_BOX = '0 0 256 367';
export const GOOGLE_MAPS_ICON_PATHS: ReadonlyArray<{ d: string; fill: string }> = [
  {
    d: 'M70.5853976,271.865254 C81.1995596,285.391378 90.8598594,299.639537 99.4963338,314.50654 C106.870174,328.489419 109.94381,337.97007 115.333495,354.817346 C118.638014,364.124835 121.625069,366.902652 128.046515,366.902652 C135.045169,366.902652 138.219816,362.176756 140.672953,354.867852 C145.766819,338.95854 149.763988,326.815514 156.069992,315.343493 C168.443902,293.193112 183.819296,273.510299 198.927732,254.592287 C203.018698,249.238677 229.462067,218.047767 241.366994,193.437035 C241.366994,193.437035 255.999233,166.402027 255.999233,128.645368 C255.999233,93.3274168 241.569017,68.8321265 241.569017,68.8321265 L200.024428,79.9578224 L174.793197,146.408963 L168.552129,155.57215 L167.303915,157.231625 L165.64444,159.309576 L162.729537,162.628525 L158.56642,166.791642 L136.098575,185.09637 L79.928962,217.528279 L70.5853976,271.865254 Z',
    fill: '#34A853',
  },
  {
    d: 'M12.6120081,188.891517 C26.3207125,220.205084 52.7568668,247.730719 70.6431185,271.8869 L165.64444,159.352866 C165.64444,159.352866 152.260416,176.856717 127.981579,176.856717 C100.939355,176.856717 79.0920095,155.2619 79.0920095,128.032084 C79.0920095,109.359386 90.325932,96.5309245 90.325932,96.5309245 L25.8373003,113.811107 L12.6120081,188.891517 Z',
    fill: '#FBBC04',
  },
  {
    d: 'M166.705061,5.78651629 C198.256727,15.959818 225.262874,37.3165365 241.597878,68.8104812 L165.673301,159.28793 C165.673301,159.28793 176.907223,146.228586 176.907223,127.671329 C176.907223,99.8065834 153.443693,78.990998 128.09702,78.990998 C104.128433,78.990998 90.3620076,96.4659886 90.3620076,96.4659886 L90.3620076,39.4666386 L166.705061,5.78651629 Z',
    fill: '#4285F4',
  },
  {
    d: 'M30.0148476,45.7654275 C48.8607087,23.2182162 82.0213432,0 127.736265,0 C149.915506,0 166.625695,5.82259183 166.625695,5.82259183 L90.2898565,96.5164943 L36.2054099,96.5164943 L30.0148476,45.7654275 Z',
    fill: '#1A73E8',
  },
  {
    d: 'M12.6120081,188.891517 C12.6120081,188.891517 0,164.194204 0,128.414485 C0,94.5972757 13.145926,65.0369799 30.0148476,45.7654275 L90.3331471,96.5237094 L12.6120081,188.891517 Z',
    fill: '#EA4335',
  },
];

// Per-brand hover/pressed tints, hardcoded rather than theme tokens: each
// belongs to one brand's own mark, not a reusable design-system role
// (0027-full-color-brand-marks-on-navigation-links.md). Waze's tint is darkened from
// the brand cyan (not the brand value itself): white text on `#03A6C0` measured
// 2.91:1, below the 4.5:1 floor for 17px text, so it is darkened to `#027A8C`, which
// measures 5.04:1 by the WCAG relative-luminance formula.
export const WAZE_BUTTON_HOVER_COLOR = '#027A8C';
export const GOOGLE_MAPS_BUTTON_HOVER_COLOR = '#3367D6';
