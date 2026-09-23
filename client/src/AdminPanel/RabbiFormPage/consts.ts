import type { RabbiProminence } from '@torabarabim/common';

import { PROMINENCE_LABELS } from '~/AdminPanel/consts';
import { RABBI_HONORIFIC_LABELS } from '~/consts';

export const BACK_TO_LIST_LABEL = '→ חזרה לרשימת הרבנים';
// Edit mode's breadcrumb: the rabbi already exists, so "back" returns to
// their own view page rather than the list. Honorific-aware: pass
// `RABBI_HONORIFIC_LABELS[form.honorific]`.
export const backToRabbiLabel = (honorific: string): string => `→ חזרה לעמוד ${honorific}`;
export const NEW_RABBI_HEADING = 'רב חדש';
export const REQUIRED_FIELDS_NOTE = 'רק השם הוא שדה חובה. תמונה, תואר ותקציר אפשר להוסיף גם אחר כך.';

export const HONORIFIC_LABEL = 'הרב או הרבנית';
export const HONORIFIC_HELPER = 'רבנית יכולה ללמד רק שיעורים לנשים. אי אפשר לשנות את התואר אחרי היצירה.';
export const HONORIFIC_READONLY_NOTE = 'נקבע ביצירת הרב ולא ניתן לשנותו. תואר שגוי דורש מחיקת הרב ויצירתו מחדש.';
// The canonical map is `RABBI_HONORIFIC_LABELS` (`~/consts.ts`); read it
// directly at the call site rather than re-declaring or re-exporting it
// here, which would just be a second name for the same source of truth.
export const HONORIFIC_OPTIONS = Object.keys(RABBI_HONORIFIC_LABELS) as (keyof typeof RABBI_HONORIFIC_LABELS)[];

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

export const PHOTO_LABEL = 'תמונת הרב';

export const CANCEL_LABEL = 'ביטול';
export const SAVE_AND_ADD_LESSON_LABEL = 'שמירת הרב והוספת שיעור ראשון';
export const SAVE_LABEL = 'שמירת הרב';
export const SAVING_LABEL = 'שומרים...';

// `DiscardChangesSheet`'s copy, edit mode only: cancelling with unsaved
// changes confirms before discarding them, the same dirty-check
// confirm-sheet pattern as `RabbiPanel/UpcomingPage`'s
// `CancelOccurrenceSheet`. Identical, word for word, to
// `LessonFormPage/components/DiscardChangesSheet/consts.ts`'s copy: the two
// sheets confirm the same action and are slated to be lifted into one
// shared component, so they read as one voice already.
export const DISCARD_CHANGES_HEADING = 'לצאת בלי לשמור?';
export const DISCARD_CHANGES_BODY = 'השינויים שעשית לא יישמרו.';
export const DISCARD_CHANGES_CONFIRM_LABEL = 'כן, לצאת בלי לשמור';
export const DISCARD_CHANGES_BACK_LABEL = 'חזרה לעריכה';

export const REQUIRED_NAME_ERROR = 'יש למלא שם רב';

export const LOADING_MESSAGE = 'טוענים...';
export const RETRY_LABEL = 'ניסיון נוסף';

export const DELETE_LABEL = 'מחיקת הרב';
export const DELETE_CONFIRM_HEADING = 'למחוק את הרב?';
export const DELETE_CONFIRM_IRREVERSIBLE_NOTE = 'הפעולה בלתי הפיכה.';
export const deleteConfirmImpactLabel = (lessonCount: number, exceptionCount: number): string => {
  const lessonsPart = lessonCount === 1 ? 'שיעור אחד' : `${lessonCount} שיעורים`;
  const exceptionsPart = exceptionCount === 1 ? 'חריג אחד' : `${exceptionCount} חריגים`;
  return `מחיקת הרב תמחק גם ${lessonsPart} ו-${exceptionsPart} המשויכים אליו.`;
};
export const DELETE_CONFIRM_CANCEL_LABEL = 'ביטול';
export const DELETE_CONFIRM_CONFIRM_LABEL = 'כן, למחוק';
export const DELETE_PREVIEW_LOADING_MESSAGE = 'בודקים מה יימחק...';
