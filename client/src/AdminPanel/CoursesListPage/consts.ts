import type { AdminCourseStatusFilter } from './models';

export const HEADING = 'קורסים';
export const ADD_COURSE_LABEL = 'הוספת קורס';

export const STATUS_FILTER_LABEL = 'סינון לפי מצב';
export const STATUS_FILTER_LABELS: Record<AdminCourseStatusFilter, string> = {
  all: 'כל המצבים',
  open: 'ההרשמה פתוחה',
  full: 'תפוסה מלאה',
  closed: 'ההרשמה נסגרה',
};
export const STATUS_FILTER_OPTIONS: AdminCourseStatusFilter[] = ['all', 'open', 'full', 'closed'];

export const RABBI_FILTER_PLACEHOLDER = 'כל הרבנים והרבניות';
export const SEARCH_LABEL = 'חיפוש לפי שם קורס';
export const SEARCH_PLACEHOLDER = 'חיפוש לפי שם קורס';
export const FILTERS_TOGGLE_LABEL = (count: number): string => (count === 0 ? 'סינון' : `סינון · ${count}`);
export const CLEAR_FILTERS_LABEL = 'איפוס הסינון';

export const SORT_NOTE = '"ההרשמה פתוחה" קודם, מתאריך הפתיחה הקרוב. בסוף: "תפוסה מלאה" ו"ההרשמה נסגרה".';

export const TABLE_NAME_HEADER = 'שם הקורס';
export const TABLE_TEACHER_HEADER = 'מי מלמד';
export const TABLE_OPENING_HEADER = 'פתיחה';
export const TABLE_WEEKS_HEADER = 'שבועות';
export const TABLE_CITY_HEADER = 'עיר';
export const TABLE_STATUS_HEADER = 'מצב';

export const LOADING_MESSAGE = 'טוענים קורסים...';
export const EMPTY_HEADLINE = 'עוד אין קורסים במערכת';
export const EMPTY_HINT = 'הקורס הראשון שיתווסף יופיע כאן.';
export const NO_MATCH_HEADLINE = 'לא נמצאו קורסים תואמים';
export const ERROR_MESSAGE = 'לא הצלחנו לטעון את הקורסים';
export const RETRY_LABEL = 'ניסיון נוסף';

export const UNLINKED_TEACHER_LIST_SUFFIX = 'אין קישור לרב';
export const unlinkedTeacherListLabel = (name: string): string => `${name} · ${UNLINKED_TEACHER_LIST_SUFFIX}`;
