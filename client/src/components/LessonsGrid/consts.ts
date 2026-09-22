// The card's fixed ceiling from md (768) up: mirrored from
// HomePage/components/LessonRail/consts.ts's RAIL_CARD_WIDTH_DESKTOP, since
// the rail and the grid share one card size across the whole site
// (design-system.md, "The card is one size across the whole site"). Kept as
// its own constant rather than imported, so this shared, feature-agnostic
// component does not reach up into a specific page's component tree for a
// value; move both to one theme token if a third caller ever needs it.
export const GRID_CARD_WIDTH_DESKTOP = '308px';
