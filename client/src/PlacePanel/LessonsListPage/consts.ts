import type { Weekday } from '@torabarabim/common';

// Verbatim from `RabbiPanel/LessonsListPage/consts.ts`: none of these five
// or the weekday table name a rabbi, so the same screen reads correctly
// for a place account.
export const HEADING = 'השיעורים שלי';
export const ADD_LESSON_LABEL = 'הוספת שיעור';
export const EDIT_LESSON_LABEL = 'עריכת השיעור';

export const RECURRING_FALLBACK_TITLE = 'שיעור קבוע';
export const ONE_TIME_FALLBACK_TITLE = 'שיעור חד־פעמי';
export const RECURRING_TAG_LABEL = 'קבוע';
export const ONE_TIME_TAG_LABEL = 'חד־פעמי';

export const LOADING_MESSAGE = 'טוען...'; // out of scope: kept exactly as the rabbi panel's, per the build brief.

export const EMPTY_HEADLINE = 'עוד לא הוספת שיעור';
export const EMPTY_HINT = 'כל שיעור שיתווסף יעלה לאתר מיד ויופיע כאן.';
export const EMPTY_CTA = 'הוספת השיעור הראשון';

export const ERROR_MESSAGE = 'לא הצלחנו לטעון את השיעורים שלך';
export const RETRY_LABEL = 'ניסיון נוסף';

// `RabbiPanel/LessonsListPage/consts.ts`'s `countLabel` reads "...מופיעים
// באתר על שמך", which names a rabbi's own name; a place's lessons sit at
// the place, not "under its name" the same way, so this is not a verbatim
// reuse. Not called for zero lessons: `LessonsListPage.tsx` renders
// `EMPTY_HEADLINE` instead, which already says there is nothing here.
export const countLabel = (n: number): string => (n === 1 ? 'שיעור אחד מופיע באתר במקום שלך.' : `${n} שיעורים מופיעים באתר במקום שלך.`);

// `Record`, not an array, so indexing by `Weekday` needs no bounds check:
// every `Weekday` (0-6) has an entry by construction. Mirrors
// `RabbiPanel/LessonsListPage/consts.ts`'s own table.
export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'ראשון',
  1: 'שני',
  2: 'שלישי',
  3: 'רביעי',
  4: 'חמישי',
  5: 'שישי',
  6: 'שבת',
};
