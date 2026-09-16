// Cap per area before a "עוד N ערים" button appears (build spec, "Open
// state, before typing"). An area left with fewer than
// MIN_HIDDEN_CITIES_TO_EXPAND cities hidden renders all of them instead:
// hiding one or two cities behind a button is not worth the tap.
export const MAX_VISIBLE_CITIES = 6;
export const MIN_HIDDEN_CITIES_TO_EXPAND = 3;

export const remainingCitiesLabel = (count: number): string => `עוד ${count} ערים`;
