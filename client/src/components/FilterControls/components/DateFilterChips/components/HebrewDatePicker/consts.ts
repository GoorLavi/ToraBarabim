// The one place the forward browsing limit lives (build spec, section 5,
// "Forward bound: 12 months from today").
export const MAX_MONTHS_AHEAD = 12;

export const WEEK_LENGTH = 7;
export const GRID_ROW_COUNT = 6;
export const GRID_CELL_COUNT = WEEK_LENGTH * GRID_ROW_COUNT;

export const PREVIOUS_MONTH_LABEL = 'לחודש הקודם';
export const NEXT_MONTH_LABEL = 'לחודש הבא';
export const RESET_TO_CURRENT_MONTH_LABEL = 'לחודש הנוכחי';
export const CLEAR_ALL_DATES_LABEL = 'כל התאריכים';

// Selection itself is conveyed by aria-selected, never by a string; this
// only marks today among the accessible day names.
export const TODAY_SUFFIX = ', היום';
