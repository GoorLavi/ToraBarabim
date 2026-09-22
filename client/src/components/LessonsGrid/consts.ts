// The grid's own fixed ceiling from md (768) up. The rail moved to its own
// four-tier width ladder (LessonRail/consts.ts) and deliberately never
// reaches this value (design-system.md, "308 stays the ceiling and the rail
// never reaches it"), so the two are no longer mirrored; syncing the grid's
// own breakpoints to the rail's tiers is an open follow-up, not done here.
export const GRID_CARD_WIDTH_DESKTOP = '308px';
