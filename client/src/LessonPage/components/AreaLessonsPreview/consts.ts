// Caps the grid at 3 columns even at `xl`, so the preview never outgrows the
// 880 reading column by following the sitewide grid to 4 (LessonsGrid's own
// `maxColumns` prop; design-system.md, "The lesson grid steps"). Passed to
// both the skeleton and the loaded grid (styles.ts), so they never disagree
// on layout.
export const PREVIEW_MAX_COLUMNS = 3;
