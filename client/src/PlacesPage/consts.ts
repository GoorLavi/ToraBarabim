export const PLACES_QUERY_KEYS = {
  directory: () => ['places', 'directory'] as const,
};

export const SEARCH_FIELD_ID = 'places-search-field';

export const PAGE_TITLE = 'כל המקומות';
export const SEARCH_FIELD_LABEL = 'חיפוש בתוך המקומות';
export const SEARCH_INPUT_ARIA_LABEL = 'חיפוש מקום לפי שם';

export const LOAD_ERROR_HEADING = 'לא הצלחנו לטעון את רשימת המקומות';
export const LOAD_ERROR_BODY = 'משהו השתבש בדרך אלינו. אפשר לנסות שוב.';
export const RETRY_LABEL = 'נסו שוב';

export const BOARD_EMPTY_HEADING = 'עדיין אין מקומות בלוח';
export const BOARD_EMPTY_BODY = 'הלוח נבנה בימים אלה. אם אתם מכירים שיעור, כתבו לנו ונוסיף אותו.';
export const CONTACT_US_LABEL = 'כתבו לנו';

export const NO_RESULTS_HEADING_PREFIX = 'לא מצאנו תוצאות עבור "';
export const NO_RESULTS_HEADING_SUFFIX = '"';
export const NO_RESULTS_BODY = 'אולי השם כתוב אצלנו קצת אחרת. אפשר לנקות את החיפוש ולעבור על כל הרשימה.';
export const CLEAR_SEARCH_LABEL = 'ניקוי החיפוש';

export const placeCountLabel = (count: number): string => (count === 1 ? 'מקום אחד' : `${count} מקומות`);
export const placeMatchCountLabel = (count: number): string => (count === 1 ? 'נמצא מקום אחד' : `נמצאו ${count} מקומות`);

// Six placeholder rows, matching RabbisPage/consts.ts's own ROW_SKELETON_KEYS.
export const ROW_SKELETON_KEYS = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6'] as const;
