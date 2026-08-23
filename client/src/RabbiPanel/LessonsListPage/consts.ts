import type { LessonAudience, Weekday } from '@torabarabim/common';

export const HEADING = 'השיעורים שלי';
export const countLabel = (n: number): string => `${n} שיעורים מופיעים באתר על שמך.`;
export const ADD_LESSON_LABEL = 'הוספת שיעור';
export const EDIT_LESSON_LABEL = 'עריכת השיעור';

export const RECURRING_FALLBACK_TITLE = 'שיעור קבוע';
export const ONE_TIME_FALLBACK_TITLE = 'שיעור חד־פעמי';
export const RECURRING_TAG_LABEL = 'קבוע';
export const ONE_TIME_TAG_LABEL = 'חד־פעמי';

export const LOADING_MESSAGE = 'טוען...';

export const EMPTY_HEADLINE = 'עוד לא הוספת שיעור';
export const EMPTY_HINT = 'כל שיעור שתוסיף יעלה לאתר מיד ויופיע כאן.';
export const EMPTY_CTA = 'הוספת השיעור הראשון';

export const ERROR_MESSAGE = 'לא הצלחנו לטעון את השיעורים שלך';
export const RETRY_LABEL = 'ניסיון נוסף';

// Duplicated from `AudiencePicker/consts.ts` rather than imported: this
// screen only needs a plain lookup, not the picker itself. Never `מעורב`
// (design-system.md, Audience wording).
export const AUDIENCE_LABELS: Record<LessonAudience, string> = {
  men: 'גברים',
  women: 'נשים',
  mixed: 'גם גברים וגם נשים',
};

// `Record`, not an array, so indexing by `Weekday` needs no bounds check:
// every `Weekday` (0-6) has an entry by construction.
export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'ראשון',
  1: 'שני',
  2: 'שלישי',
  3: 'רביעי',
  4: 'חמישי',
  5: 'שישי',
  6: 'שבת',
};
