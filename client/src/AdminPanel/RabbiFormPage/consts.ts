import type { RabbiHonorific, RabbiProminence } from '@torabarabim/common';

import { PROMINENCE_LABELS } from '~/AdminPanel/consts';

export const BACK_TO_LIST_LABEL = '→ חזרה לרשימת הרבנים';
// Edit mode's breadcrumb: the rabbi already exists, so "back" returns to
// their own view page rather than the list (this slice's brief).
export const BACK_TO_RABBI_LABEL = '→ חזרה לעמוד הרב';
export const NEW_RABBI_HEADING = 'רב חדש';
export const REQUIRED_FIELDS_NOTE = 'רק השם הוא שדה חובה. תמונה, תואר ותקציר אפשר להוסיף גם אחר כך.';

export const HONORIFIC_LABEL = 'הרב או הרבנית';
export const HONORIFIC_HELPER = 'רבנית יכולה ללמד רק שיעורים לנשים. אי אפשר לשנות את התואר אחרי היצירה.';
export const HONORIFIC_READONLY_NOTE = 'נקבע ביצירת הרב ולא ניתן לשנותו. תואר שגוי דורש מחיקת הרב ויצירתו מחדש.';
export const HONORIFIC_LABELS: Record<RabbiHonorific, string> = {
  rav: 'הרב',
  rabbanit: 'הרבנית',
};
// `@torabarabim/common` is types only, so this list is hand-mirrored from
// the `RabbiHonorific` union (rabbi.ts), the same pattern as
// `PROMINENCE_OPTIONS` below.
export const HONORIFIC_OPTIONS: readonly RabbiHonorific[] = Object.keys(HONORIFIC_LABELS) as RabbiHonorific[];

export const NAME_LABEL = 'שם הרב';
export const NAME_HELPER = 'השם בלבד, בלי "הרב" או "הרבנית". הפנייה נוספת אוטומטית.';

export const TITLE_LABEL = 'תואר';
export const TITLE_PLACEHOLDER = 'למשל: רב בית הכנסת אהל יוסף';
export const TITLE_HELPER = 'לא חובה. מופיע בשורה קטנה מתחת לשם.';

// Labelled for someone editing another person's record, not the rabbi's
// own first-person "קצת עליי" (see the report for this slice).
export const BIO_LABEL = 'קצת על הרב';
export const BIO_HELPER = 'לא חובה. מוצג בעמוד הרב באתר.';

export const PROMINENCE_LABEL = 'בולטות הרב';
export const PROMINENCE_HELPER = 'קובעת את מיקום הרב בשורות עמוד הבית. ברירת המחדל היא "אזורי".';

// `@torabarabim/common` is types only by decision: no "main"/"exports" entry
// point, so nothing runtime can be imported from it, only `import type`. This
// list is therefore hand-mirrored from the `RabbiProminence` union in that
// package (home.ts). The imported `PROMINENCE_LABELS` is typed as
// `Record<RabbiProminence, string>`, which is exhaustive: if the union gains
// a member, `AdminPanel/consts.ts` fails to build until it is given a Hebrew
// label, which is the thing a person actually needs to supply.
export const PROMINENCE_OPTIONS: readonly RabbiProminence[] = Object.keys(
  PROMINENCE_LABELS,
) as RabbiProminence[];

// `RabbiViewPage` needs the same value map for its read-only field, and
// lifted to `AdminPanel/consts.ts` when it became that second caller. This
// file keeps its own name for it so `RabbiFormPage.tsx`'s namespaced
// `consts.PROMINENCE_LABELS` reads unchanged.
export { PROMINENCE_LABELS } from '~/AdminPanel/consts';

export const PHOTO_LABEL = 'תמונת הרב';

export const CANCEL_LABEL = 'ביטול';
export const SAVE_AND_ADD_LESSON_LABEL = 'שמירת הרב והוספת שיעור ראשון';
export const SAVE_LABEL = 'שמירת הרב';
export const SAVING_LABEL = 'שומרים...';

// `DiscardChangesSheet`'s copy, edit mode only: cancelling with unsaved
// changes confirms before discarding them, the same dirty-check
// confirm-sheet pattern as `RabbiPanel/UpcomingPage`'s
// `CancelOccurrenceSheet`. Placeholder copy, Hebrew-editor review.
export const DISCARD_CHANGES_HEADING = 'לצאת בלי לשמור?';
export const DISCARD_CHANGES_BODY = 'השינויים שביצעת לא יישמרו אם תצאו עכשיו.';
export const DISCARD_CHANGES_CONFIRM_LABEL = 'יציאה בלי שמירה';
export const DISCARD_CHANGES_BACK_LABEL = 'המשך בעריכה';

export const REQUIRED_NAME_ERROR = 'יש למלא שם רב';
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
