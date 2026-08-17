export const SEARCH_PARAM = 'q';

export const HEADING = 'רבנים';
export const ADD_RABBI_LABEL = 'הוספת רב';
export const SORT_LABEL = 'מיון: לפי שם';
export const SEARCH_PLACEHOLDER = 'חיפוש רב לפי שם';
export const SEARCH_LABEL = 'חיפוש רבנים';

// `GET /v1/admin/rabbis` returns no lesson count and no city (a rabbi has
// no city of their own on the wire; see the report for this slice), so the
// subheading only states what the list response actually carries.
export const totalCountLabel = (total: number): string => `${total} רבנים במערכת`;

export const EDIT_LABEL = 'עריכה';
export const NEW_LESSON_LABEL = 'שיעור חדש';
export const NO_LESSONS_YET_LABEL = 'אין שיעורים עדיין';
export const lessonCountLabel = (count: number): string => `${count} שיעורים`;

export const LOADING_MESSAGE = 'טוענים רבנים...';
export const RETRY_LABEL = 'ניסיון נוסף';
export const ERROR_MESSAGE = 'לא הצלחנו לטעון את הרבנים';

export const NO_RABBIS_HEADLINE = 'עוד אין רבנים במערכת';
export const NO_RABBIS_HINT = 'הוספת הרב הראשון תפתח כאן את רשימת הרבנים.';
export const ADD_FIRST_RABBI_LABEL = 'הוספת רב ראשון';

export const NO_MATCHING_RABBIS_HEADLINE = 'לא נמצאו רבנים תואמים';
export const NO_MATCHING_RABBIS_HINT = 'נסו חיפוש אחר.';
export const CLEAR_SEARCH_LABEL = 'ניקוי החיפוש';
