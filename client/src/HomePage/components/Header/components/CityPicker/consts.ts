// Shown on the pill when no city is chosen: a real "all areas" state
// (design-system.md, "No default city"), distinct from any chosen city's
// name.
export const ALL_AREAS_LABEL = 'כל הארץ';
export const SEARCH_PLACEHOLDER = 'חיפוש עיר';
export const SEARCH_LABEL = 'חיפוש עיר';
export const OPEN_PICKER_LABEL = 'בחירת עיר';
export const LOADING_MESSAGE = 'מחפש ערים...';
export const NO_RESULTS_MESSAGE = 'לא נמצאו ערים תואמות';
export const SEARCH_HINT = 'הקלידו שם עיר';

// The selected pill's own accessible name names the action a second tap
// takes, the same pattern as the date chips: no hint text, no tooltip.
export const clearCityLabel = (name: string): string => `${name}, הסרת הסינון`;
