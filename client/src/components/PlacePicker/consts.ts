export const HELPER_LINE = 'בוחרים מקום מהרשימה. אם המקום לא ברשימה, ממלאים את הכתובת.';

// Mirrors RabbiPicker's own placeholder pair (RABBI_SEARCH_PLACEHOLDER /
// RABBI_SEARCH_LABEL).
export const PICKER_PLACEHOLDER = 'בחירת מקום מהרשימה';
export const PICKER_SEARCH_LABEL = 'חיפוש מקום';

export const OR_LABEL = 'או';

export const CANCEL_PLACE_LABEL = 'ביטול הבחירה והקלדת כתובת';
export const CANCEL_PLACE_ARIA_LABEL = 'ביטול בחירת המקום והקלדת הכתובת בשדות שלמטה';

// Mirrors `AdminPanel/PlacesListPage/consts.ts`'s own `LOADING_MESSAGE` and
// `NO_MATCHING_PLACES_HEADLINE`, and `PlacesPage/consts.ts`'s own
// `LOAD_ERROR_HEADING`: this control's search never had loading, empty or
// error copy of its own before `SearchSelect` required every caller to
// supply it, so this reuses the site's own established wording for the
// same entity rather than inventing new copy.
export const PICKER_SEARCH_LOADING_MESSAGE = 'טוענים מקומות...';
export const PICKER_SEARCH_EMPTY_MESSAGE = 'לא נמצאו מקומות תואמים';
export const PICKER_SEARCH_ERROR_MESSAGE = 'לא הצלחנו לטעון את רשימת המקומות';

export const LOCKED_REASON = 'הכתובת מגיעה מהמקום שנבחר, ואי אפשר לערוך אותה כאן.';

// Relocated as-is from the two lesson forms' own `consts.ts` (not new
// copy): the WHERE section's field labels now render inside this shared
// component instead of at each call site.
export const CITY_LABEL = 'עיר';
export const CITY_HELPER = 'בוחרים מהרשימה. העיר קובעת גם את האזור.';
export const CITY_PLACEHOLDER = 'בחירת עיר';
export const PLACE_NAME_LABEL = 'שם בית הכנסת או המוסד';
export const STREET_LABEL = 'רחוב ומספר';
export const STREET_HELPER = 'הכתובת המלאה מוצגת רק בעמוד השיעור.';
export const FLOOR_LABEL = 'קומה או הוראות הגעה';

export const REQUIRED_CITY_ERROR = 'יש לבחור עיר';
export const REQUIRED_ADDRESS_NAME_ERROR = 'יש למלא את שם בית הכנסת או המוסד';
export const REQUIRED_STREET_ERROR = 'יש למלא רחוב ומספר';
export const UNKNOWN_CITY_ERROR = 'העיר שנבחרה אינה קיימת יותר. יש לבחור עיר אחרת';

// The duplicate hint's one sentence, split so the place name can be its own
// text node carrying `dir='auto'` inside it.
export const DUPLICATE_HINT_PREFIX = 'רשום אצלנו מקום בשם "';
export const DUPLICATE_HINT_SUFFIX = '" בעיר הזאת. אפשר לבחור אותו מהרשימה.';
export const DUPLICATE_HINT_CONFIRM_LABEL = 'כן, זה המקום';
export const DUPLICATE_HINT_DISMISS_LABEL = 'לא, להמשיך עם הכתובת';

// Debounced, never per-keystroke: the hint settles this long after the last
// edit to the name or street field before it fires.
export const SIMILAR_HINT_DEBOUNCE_MS = 400;

export const PLACE_PICKER_QUERY_KEYS = {
  all: () => ['places'] as const,
  similar: (query: { cityCode: number | undefined; name: string | undefined; street: string | undefined }) =>
    ['places', 'similar', query] as const,
};
