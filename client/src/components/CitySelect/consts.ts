export const SEARCH_PLACEHOLDER = 'חיפוש עיר';
export const SEARCH_LABEL = 'חיפוש עיר';
export const LOADING_MESSAGE = 'מחפש ערים...';
export const NO_RESULTS_MESSAGE = 'לא נמצאו ערים תואמות';
export const SEARCH_HINT = 'הקלד שם עיר';
export const CLEAR_LABEL = 'ניקוי';

export const CITY_SELECT_QUERY_KEYS = {
  search: (q: string) => ['citySelect', 'cities', 'search', q] as const,
};
