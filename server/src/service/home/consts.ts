import type { RabbiProminence } from '@torabarabim/common';

// The length of the home window in days, counting today as day one.
export const HOME_WINDOW_DAYS = 14;

export const MAX_ITEMS_PER_ROW = 12;
export const MIN_ITEMS_PER_ROW = 3;

// The women's-area tile's slot within the row that carries it: the fourth
// item (0-based index 3), at every width.
export const WOMENS_AREA_TILE_INDEX = 3;

// A row needs at least this many lessons to carry the tile, so it always
// has a real item before it. Not the same idea as MIN_ITEMS_PER_ROW (3):
// today they are close in value, but one is "a row is worth sending at
// all" and the other is "this row has a fourth slot for the tile", kept
// separate on purpose.
export const WOMENS_AREA_TILE_MIN_LESSONS = 4;

// Cadence: at most one tile per this many rows, starting from the row at
// WOMENS_AREA_TILE_FIRST_CANDIDATE_ROW (0-based) below. If that candidate
// row is too short, the tile moves to the next row that qualifies, and the
// next candidate is counted this many rows on from the row actually used.
export const WOMENS_AREA_TILE_ROW_CADENCE = 3;

// 0-based index of the first candidate row (the second row).
export const WOMENS_AREA_TILE_FIRST_CANDIDATE_ROW = 1;

// Lower rank sorts first: sought, then known, then local.
export const PROMINENCE_RANK: Record<RabbiProminence, number> = {
  sought: 0,
  known: 1,
  local: 2,
};
