import type { LessonTopic } from '@torabarabim/common';

import { LESSON_TOPIC_LABELS } from '~/HomePage/components/LessonCard/consts';

import type { LessonFormField } from './models';

// Verbatim from `RabbiPanel/LessonFormPage/consts.ts`: none of these name a
// venue or a fixed rabbi, so the same strings read correctly on a form that
// instead has a rabbi picker and no address fields.
export const BACK_TO_LIST_LABEL = '→ חזרה לשיעורים שלי';
export const NEW_HEADING = 'שיעור חדש';
export const EDIT_HEADING = 'עריכת שיעור';

export const TITLE_LABEL = 'שם השיעור';
export const TITLE_HELPER = 'לא חובה. בלי שם, השיעור יופיע באתר לפי הנושא שנבחר.';

export const WHEN_SECTION_HEADING = 'מתי מתקיים השיעור';
export const AUDIENCE_SECTION_HEADING = 'למי השיעור מיועד';

export const LIVE_NOTE = 'מה שתשמור כאן יופיע באתר מיד.';
export const SAVE_LABEL = 'שמירת השיעור';
export const SAVING_LABEL = 'שומר...'; // out of scope: kept exactly as the rabbi panel's, per the build brief.
export const CANCEL_LABEL = 'ביטול';

export const ERROR_SUMMARY_HEADING = 'יש להשלים כמה שדות לפני השמירה:';
export const REQUIRED_AUDIENCE_ERROR = 'יש לבחור קהל יעד';
export const REQUIRED_START_TIME_ERROR = 'יש למלא שעת התחלה';
export const REQUIRED_DURATION_ERROR = 'יש למלא משך שיעור תקין (בדקות)';
export const REQUIRED_WEEKDAY_ERROR = 'יש לבחור לפחות יום אחד בשבוע';
export const REQUIRED_DATE_ERROR = 'יש לבחור תאריך';

export const LOADING_MESSAGE = 'טוען...';
export const LOAD_ERROR_MESSAGE = 'לא הצלחנו לטעון את השיעור';
export const RETRY_LABEL = 'ניסיון נוסף';

export const DEFAULT_DURATION_MINUTES = '60';

// No counterpart. `RabbiPanel/LessonFormPage/consts.ts`'s `ownershipNote`
// names the fixed rabbi ("רשום על שמך... תחת <name>"); here the place is
// fixed and the rabbi is chosen, the opposite shape, so it is not a
// verbatim reuse. `של`, never a prefixed `ב`: a place name is free text, so
// `ב<name>` can read as a grammar or a meaning error depending on the name.
// Split into a prefix and a suffix, mirroring `PlacePicker/consts.ts`'s
// `DUPLICATE_HINT_PREFIX`/`_SUFFIX`, so the place name can sit in its own
// `dir='auto'` text node: the name is free text and can open with a Latin
// character, which drags a quote mark inside the same string to the wrong
// side.
export const OWNERSHIP_NOTE_PREFIX = 'השיעור יופיע באתר במקום שלך, "';
export const OWNERSHIP_NOTE_SUFFIX = '". כל השדות חובה, חוץ משם השיעור, הנושא וההערות.';

// This section, and the rabbi picker inside it, has no counterpart in
// `RabbiPanel` (its lesson form has no rabbi picker at all).
export const WHO_SECTION_HEADING = 'מי מעביר את השיעור';
export const REQUIRED_RABBI_ERROR = 'יש לבחור רב או רבנית';

// `topic` has no UI anywhere else in the codebase yet (not even on the
// admin lesson form) to reuse from.
export const TOPIC_SECTION_HEADING = 'נושא השיעור';
export const TOPIC_UNSET_OPTION_LABEL = 'בלי נושא';
// `LESSON_TOPIC_LABELS` itself is a real, already-shipped reuse (from
// `HomePage/components/LessonCard/consts.ts`, this builder's own prefix),
// not a placeholder: it is the exact set of Hebrew topic names the public
// site already shows.
export const TOPIC_OPTIONS: { value: LessonTopic; label: string }[] = (
  Object.entries(LESSON_TOPIC_LABELS) as [LessonTopic, string][]
).map(([value, label]) => ({ value, label }));

// `notes` has no UI anywhere else in the codebase yet to reuse from.
export const NOTES_SECTION_HEADING = 'הערות';
export const NOTES_HELPER = 'לא חובה. ההערה נשמרת במערכת ולא מוצגת באתר.';

// Groups the form's fields by their visible section, mirroring the rabbi
// form's `SECTION_DEFS` with `rabbi` in place of the address fields it has
// none of.
export const SECTION_DEFS: { fields: LessonFormField[]; heading: string }[] = [
  { fields: ['rabbi'], heading: WHO_SECTION_HEADING },
  { fields: ['recurrence', 'startTime', 'durationMinutes'], heading: WHEN_SECTION_HEADING },
  { fields: ['audience'], heading: AUDIENCE_SECTION_HEADING },
];
