// The poster's fixed size on the ticket (design spec, "The poster is inside
// the silhouette"). Ratio 3:4, matching the code's existing ratio in
// HomePage/components/LessonCard/styles.ts; design-system.md's "2:3" is
// wrong and is corrected in a separate pass (see this slice's report).
export const POSTER_WIDTH_PHONE = '132px';
export const POSTER_WIDTH_DESKTOP = '210px';

// Half of this sits outside the ticket's own edge; `overflow: hidden` on the
// ticket clips that half, leaving the bite that reads as a punched notch.
export const NOTCH_DIAMETER = '16px';

// The perforation's rhythm (design spec): a 2px dash, a 5px gap, at 1.5px
// thickness. Drawn as a repeating gradient rather than `border-style: dashed`,
// which cannot hold a gap this precise across browsers.
export const PERFORATION_DASH = '2px';
export const PERFORATION_GAP = '5px';
export const PERFORATION_THICKNESS = '1.5px';

// The stub and body's own block padding: 24 inline (theme.spacing.xl) but 20
// block, a value the shared spacing scale has no step for (frame measurement).
export const PANEL_BLOCK_PADDING = '20px';

// The stub's single-column layout at `lg`: a short rule between the date and
// the time, in place of the two-column layout's full-height vertical hairline.
export const STUB_DIVIDER_LENGTH_DESKTOP = '56px';

// The poster's own gap from the top of its row on desktop (frame measurement,
// not on the shared spacing scale).
export const POSTER_TOP_OFFSET_DESKTOP = '28px';
