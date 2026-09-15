import type { RabbiProminence } from '@torabarabim/common';

// The length of the home window in days, counting today as day one.
export const HOME_WINDOW_DAYS = 14;

export const MAX_ITEMS_PER_ROW = 12;
export const MIN_ITEMS_PER_ROW = 3;

// Where the women's-area tile sits in the first row's items, once placed.
// Not counted toward MIN/MAX_ITEMS_PER_ROW: it is inserted after the row is
// built from lessons alone.
export const WOMENS_AREA_TILE_INDEX = 1;

// Lower rank sorts first: sought, then known, then local.
export const PROMINENCE_RANK: Record<RabbiProminence, number> = {
  sought: 0,
  known: 1,
  local: 2,
};
