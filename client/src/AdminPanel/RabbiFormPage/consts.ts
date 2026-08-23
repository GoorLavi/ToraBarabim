import type { RabbiProminence } from '@torabarabim/common';

export const BACK_TO_LIST_LABEL = '→ חזרה לרשימת הרבנים';
export const NEW_RABBI_HEADING = 'רב חדש';
// Name and photo are the only required fields; title and bio are optional.
// The exact captured wording repeats itself in the brief handed to this
// slice, so it could not be confirmed; written fresh, honestly, in its
// place (see the report for this slice).
export const TWO_FIELDS_NOTE = 'שם ותמונה הם שדות חובה. אי אפשר לשמור רב בלי תמונה, כי באתר אין כרטיס בלי תמונה. תואר ותקציר אינם חובה.';

export const NAME_LABEL = 'שם הרב';
export const NAME_HELPER = 'כפי שיופיע באתר.';

export const TITLE_LABEL = 'תואר';
export const TITLE_PLACEHOLDER = 'למשל: רב בית הכנסת אהל יוסף';
export const TITLE_HELPER = 'לא חובה. מופיע בשורה קטנה מתחת לשם.';

// Labelled for someone editing another person's record, not the rabbi's
// own first-person "קצת עליי" (see the report for this slice).
export const BIO_LABEL = 'קצת על הרב';
export const BIO_HELPER = 'לא חובה. מוצג בעמוד הרב באתר.';

// Admin-only: drives the home page's rail order and is never shown to a
// visitor (design-system.md has no public surface for it).
export const PROMINENCE_LABEL = 'בולטות הרב';
export const PROMINENCE_HELPER = 'קובעת את מיקום הרב בשורות עמוד הבית. ברירת המחדל היא "אזורי".';
export const PROMINENCE_LABELS: Record<RabbiProminence, string> = {
  local: 'אזורי',
  known: 'מוכר',
  sought: 'מבוקש',
};

// `@torabarabim/common` is types only by decision: no "main"/"exports" entry
// point, so nothing runtime can be imported from it, only `import type`. This
// list is therefore hand-mirrored from the `RabbiProminence` union in that
// package (home.ts). `PROMINENCE_LABELS` above is typed as
// `Record<RabbiProminence, string>`, which is exhaustive: if the union gains
// a member, this file fails to build until it is given a Hebrew label, which
// is the thing a person actually needs to supply.
export const PROMINENCE_OPTIONS: readonly RabbiProminence[] = Object.keys(
  PROMINENCE_LABELS,
) as RabbiProminence[];

export const PHOTO_LABEL = 'תמונת הרב';

export const CANCEL_LABEL = 'ביטול';
export const SAVE_AND_ADD_LESSON_LABEL = 'שמירת הרב והוספת שיעור ראשון';
export const SAVE_LABEL = 'שמירת הרב';
export const SAVING_LABEL = 'שומרים...';

export const REQUIRED_NAME_ERROR = 'יש למלא שם רב';
export const REQUIRED_PHOTO_ERROR = 'יש לצרף תמונת רב';
export const UNSUPPORTED_TYPE_CLIENT_ERROR = 'ניתן להעלות קובץ מסוג JPG או PNG בלבד';
export const TOO_LARGE_CLIENT_ERROR = 'התמונה חורגת מהגודל המרבי של 5MB';

export const LOADING_MESSAGE = 'טוענים...';
export const RETRY_LABEL = 'ניסיון נוסף';

export const DELETE_LABEL = 'מחיקת הרב';
export const DELETE_CONFIRM_HEADING = 'למחוק את הרב?';
export const DELETE_CONFIRM_IRREVERSIBLE_NOTE = 'הפעולה בלתי הפיכה.';
export const deleteConfirmImpactLabel = (lessonCount: number, exceptionCount: number): string =>
  `מחיקת הרב תמחק גם ${lessonCount} שיעורים ו-${exceptionCount} חריגים המשויכים אליו.`;
export const DELETE_CONFIRM_CANCEL_LABEL = 'ביטול';
export const DELETE_CONFIRM_CONFIRM_LABEL = 'כן, למחוק';
export const DELETE_PREVIEW_LOADING_MESSAGE = 'בודקים מה יימחק...';

export const CLIENT_MAX_PHOTO_BYTES = 5 * 1024 * 1024;
