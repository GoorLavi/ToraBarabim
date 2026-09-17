export const BACK_TO_LIST_LABEL = '→ חזרה לרשימת הרבנים';
export const EDIT_LABEL = 'עריכת הרב';

export const LOADING_MESSAGE = 'טוענים את פרטי הרב...';
export const RETRY_LABEL = 'ניסיון נוסף';

export const HONORIFIC_LABEL = 'הרב או הרבנית';
export const NAME_LABEL = 'שם';
export const TITLE_LABEL = 'תואר';
export const TITLE_EMPTY_VALUE = 'לא הוזן תואר';
export const BIO_LABEL = 'קצת על הרב';
export const BIO_EMPTY_VALUE = 'לא נכתב תקציר';
export const PROMINENCE_LABEL = 'בולטות הרב';

// The page's second, independent query (`RabbiLessonsSection`'s
// `useRabbiLessons`): a handful of the rabbi's soonest lessons inline, with
// a "see all" overflow to the filtered `LessonsListPage` once there are
// more than this. Single caller, stays local (root CLAUDE.md, Scope and
// Boundaries: no shared threshold before a second one needs it).
export const INLINE_LESSON_CAP = 5;

export const LESSONS_SECTION_HEADING = 'השיעורים של הרב';
export const LESSONS_LOADING_MESSAGE = 'טוענים שיעורים...';
export const LESSONS_RETRY_LABEL = 'ניסיון נוסף';
// Placeholder copy, Hebrew-editor review.
export const LESSONS_EMPTY_HEADLINE = 'לרב הזה עדיין אין שיעורים';
export const LESSONS_EMPTY_HINT = 'הוספת שיעור תפתח כאן את הרשימה.';
export const ADD_LESSON_LABEL = 'הוספת שיעור לרב';
export const SEE_ALL_LESSONS_LABEL = 'לכל השיעורים של הרב';

// `fieldCount` is fixed per render and the list is never reordered or
// spliced (mirrors `LessonViewPage/consts.ts`'s `skeletonFieldKeys`).
export const skeletonFieldKeys = (fieldCount: number): string[] => Array.from({ length: fieldCount }, (_, index) => `skeleton-field-${index}`);
