// This builder's own copy, not text quoted in the brief: flagged in the
// slice's report for the editor's pass, written to match `RabbisListPage`'s
// own voice in the meantime.

export const SEARCH_PARAM = 'q';

export const HEADING = 'מקומות';
export const ADD_PLACE_LABEL = 'הוספת מקום';
export const SORT_LABEL = 'מיון: לפי עדכון אחרון';
export const SEARCH_PLACEHOLDER = 'חיפוש מקום לפי שם';
export const SEARCH_LABEL = 'חיפוש מקומות';

// Mirrors `PlacesPage/consts.ts`'s own `placeCountLabel`: a singular form,
// not `1 מקומות`.
export const totalCountLabel = (total: number): string => (total === 1 ? 'מקום אחד במערכת' : `${total} מקומות במערכת`);

export const LOADING_MESSAGE = 'טוענים מקומות...';
export const RETRY_LABEL = 'ניסיון נוסף';

export const NO_PLACES_HEADLINE = 'עוד אין מקומות במערכת';
export const NO_PLACES_HINT = 'הוספת המקום הראשון תפתח כאן את רשימת המקומות.';
export const ADD_FIRST_PLACE_LABEL = 'הוספת מקום ראשון';

export const NO_MATCHING_PLACES_HEADLINE = 'לא נמצאו מקומות תואמים';
export const NO_MATCHING_PLACES_HINT = 'נסה חיפוש אחר.';
export const CLEAR_SEARCH_LABEL = 'ניקוי החיפוש';
