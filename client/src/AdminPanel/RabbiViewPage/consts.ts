export const BACK_TO_LIST_LABEL = '→ חזרה לרשימת הרבנים';
export const EDIT_LABEL = 'עריכה';

export const LOADING_MESSAGE = 'טוענים את הפרטים...';
export const RETRY_LABEL = 'ניסיון נוסף';

export const HONORIFIC_LABEL = 'הרב או הרבנית';
export const NAME_LABEL = 'שם';
export const TITLE_LABEL = 'תואר';
export const TITLE_EMPTY_VALUE = 'לא הוזן תואר';
// Labelled for someone reading another person's record, not the rabbi's
// own first-person "קצת עליי" in `RabbiPanel/ProfilePage`.
export const BIO_LABEL = 'תקציר';
export const BIO_EMPTY_VALUE = 'לא הוזן תקציר';
export const PROMINENCE_LABEL = 'בולטות';

// The page's second, independent query (`RabbiLessonsSection`'s
// `useRabbiLessons`): a handful of the rabbi's lessons inline, with a
// "see all" overflow to the filtered `LessonsListPage` once there are more
// than this. Ordered by the server's `GET /v1/admin/lessons` (most
// recently updated first), not by soonest upcoming date: the "see all"
// list sorts by soonest, so the inline set and the head of the overflow
// list can legitimately differ. Single caller, stays local (root
// CLAUDE.md, Scope and Boundaries: no shared threshold before a second one
// needs it).
export const INLINE_LESSON_CAP = 5;

export const LESSONS_SECTION_HEADING = 'השיעורים';
export const LESSONS_LOADING_MESSAGE = 'טוענים שיעורים...';
export const LESSONS_RETRY_LABEL = 'ניסיון נוסף';
export const LESSONS_EMPTY_HEADLINE = 'עדיין אין שיעורים';
export const LESSONS_EMPTY_HINT = 'הוספת שיעור תפתח כאן את הרשימה.';
export const ADD_LESSON_LABEL = 'הוספת שיעור';
export const seeAllLessonsLabel = (total: number): string => `לכל ${total} השיעורים`;

export const SKELETON_FIELD_COUNT = 5;
