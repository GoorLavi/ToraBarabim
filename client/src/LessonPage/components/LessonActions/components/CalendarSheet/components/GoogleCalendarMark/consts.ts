// Google Calendar's mark, redrawn by hand to the Figma component on
// `99 Components` (510:1808): a white calendar page in a frame of Google's
// brand colors with a blue "31". The colors are literals on purpose, the same
// exception as the navigation links' Waze and Google Maps marks (0027, 0060):
// a brand mark never reads the theme.
export const GOOGLE_CALENDAR_MARK_VIEW_BOX = '0 0 48 48';

export const GOOGLE_CALENDAR_MARK_PATHS: ReadonlyArray<{ d: string; fill: string }> = [
  { d: 'M8 4h32a4 4 0 0 1 4 4v32a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z', fill: '#4285F4' },
  { d: 'M36 12h8v24h-8z', fill: '#FBBC04' },
  { d: 'M12 36h24v8H12z', fill: '#34A853' },
  { d: 'M36 36h8l-8 8z', fill: '#FBBC04' },
  { d: 'M44 36v4a4 4 0 0 1-4 4h-4z', fill: '#EA4335' },
  { d: 'M4 36h8v8H8a4 4 0 0 1-4-4z', fill: '#1967D2' },
  { d: 'M36 4h4a4 4 0 0 1 4 4v4h-8z', fill: '#1967D2' },
  { d: 'M12 12h24v24H12z', fill: '#FFFFFF' },
];

export const GOOGLE_CALENDAR_MARK_DIGITS_PATH =
  'M17.1 20.7c.5-1.3 1.6-2 3-2 1.9 0 3.1 1 3.1 2.5 0 1.4-1 2.3-2.7 2.4 1.9.1 3.2 1.1 3.2 2.8 0 1.7-1.5 2.9-3.6 2.9-1.6 0-2.9-.8-3.4-2.3M28.7 20.4l2.3-1.7v10.5';
export const GOOGLE_CALENDAR_MARK_DIGITS_COLOR = '#4285F4';
