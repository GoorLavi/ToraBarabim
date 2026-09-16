import type { LessonAudience, LessonImportSourceStatus, LessonTopic, Weekday } from '@torabarabim/common';

// More than this many deletions in one run withholds every deletion in the
// run, not just the source that pushed the count over. A single number,
// defined once.
export const DELETION_STOP_THRESHOLD = 10;

// A source whose planned deletions are more than half of its previously
// known lessons looks like a broken scrape, not a genuinely shrunk lineup.
// That source's deletions are withheld; the rest of the run still applies.
export const SHARP_DROP_RATIO = 0.5;

export const MAX_ROWS = 2000;

// Section 6: "duration from the end time, else 60".
export const DEFAULT_LESSON_DURATION_MINUTES = 60;

export const MINUTES_PER_HOUR = 60;
export const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

// A single advisory lock key for the whole import: only one apply runs at a
// time, across the whole process, not per row or per rabbi.
export const IMPORT_ADVISORY_LOCK_KEY = 847_362_915;

// 2MB: a full week's rows file, comfortably above the 2,000-row cap with
// room for the sources and dropped-row lists, and nowhere near what an
// abusive body would need to start hurting the server.
export const IMPORT_BODY_LIMIT_BYTES = 2 * 1024 * 1024;

export const AGENT_KEY_UNAUTHENTICATED_MESSAGE = 'מפתח הגישה חסר או שגוי';
export const AGENT_KEY_BEARER_PREFIX = 'Bearer ';

export const SOURCE_STATUSES = ['ok', 'failed'] as const satisfies readonly LessonImportSourceStatus[];

// drizzle-orm's postgres-js driver wraps the driver error in its own
// `DrizzleQueryError`, with the real `PostgresError` (and its SQLSTATE
// `code`) on `.cause`, not on the thrown error itself; see `isUniqueViolation`.
export const UNIQUE_VIOLATION = '23505';

// The procedure's own weekday vocabulary (collect-procedure.md, section 3),
// mapped onto `Weekday` (0 = Sunday). 'שבת' alone appears for a Sabbath-eve
// broadcast row; 'מוצ"ש' (motzei Shabbat) lessons happen Saturday night,
// the same Gregorian Saturday as the Sabbath itself.
export const BUILT_IN_WEEKDAY_NAMES: Record<string, Weekday> = {
  'ראשון': 0,
  'שני': 1,
  'שלישי': 2,
  'רביעי': 3,
  'חמישי': 4,
  'שישי': 5,
  // A compound condition ("Friday, and also the eve of any festival"), not
  // a second weekday: it recurs on Friday, and `BUILT_IN_WEEKDAY_NOTES`
  // below adds the festival-eve half as a note rather than dropping it.
  'שישי וערבי חג': 5,
  'שבת': 6,
  'שבת קודש': 6,
  'מוצ"ש': 6,
  "מוצ״ש": 6,
  'מוצאי שבת': 6,
};

// A weekday text that carries more meaning than "which day": kept as a
// note on the lesson rather than silently collapsed into the plain weekday
// it recurs on.
export const BUILT_IN_WEEKDAY_NOTES: Record<string, string> = {
  'שישי וערבי חג': 'השיעור מתקיים בימי שישי וגם בערבי חג.',
};

// Time kinds that keep their number as the lesson's start time but add a
// note naming what the number actually represents. 'שיעור' needs no note.
// A time kind not in this map is a `time_kind` question for a learned rule,
// or a skip.
export const BUILT_IN_TIME_KIND_NOTES: Record<string, string | undefined> = {
  'שיעור': undefined,
  'פתיחת שערים': 'השעה שמופיעה היא של פתיחת השערים, לא של תחילת השיעור.',
  'מנחה ושיעור': 'השעה שמופיעה היא של תפילת מנחה, והשיעור אחריה.',
  'ערבית ושיעור': 'השעה שמופיעה היא של תפילת ערבית, והשיעור אחריה.',
};

// 'שידור' (broadcast-only) rows are dropped outright (section 6: "broadcast-
// only skips"): there is no physical place to list. 'משולב' (combined) is
// kept like a physical lesson, since it does have one.
export const PHYSICAL_DELIVERY_TYPES = new Set(['שיעור פיזי', 'משולב']);
export const BROADCAST_ONLY_DELIVERY_TYPE = 'שידור';

// No `''` entry: an absent audience is unstated, not a claim of 'men'.
// `normalizeRow` leaves it `undefined`; the planner resolves it to the
// owner's default (men).
export const BUILT_IN_AUDIENCE_ALIASES: Record<string, LessonAudience> = {
  'גברים': 'men',
  'גברים בלבד': 'men',
  'גברים ונשים בהפרדה': 'mixed',
  'עזרת נשים פתוחה': 'mixed',
  'נשים': 'women',
  'נשים בלבד': 'women',
};

// Free text that maps onto the fixed `LessonTopic` enum; anything else is
// not an error, it becomes the lesson's title instead (section 6: "topic
// from the table, free text to the title").
export const BUILT_IN_TOPIC_ALIASES: Record<string, LessonTopic> = {
  'גמרא': 'gemara',
  'דף היומי': 'gemara',
  'הלכה': 'halacha',
  'פרשת השבוע': 'parasha',
  'פרשה': 'parasha',
  'מוסר': 'mussar',
  'חסידות': 'chassidut',
  "תנ\"ך": 'tanach',
  'תנך': 'tanach',
  'מחשבה': 'machshava',
  'אמונה': 'machshava',
};

// A handful of common spelling variants seen in the seven sources, mapped
// to the official `cities.nameHe` spelling (checked against the real local
// table, not assumed: Tel Aviv is stored as 'תל אביב - יפו', with spaces
// around the hyphen). A city not here and not a learned `city_alias` rule
// is a question the row cannot answer on its own.
export const BUILT_IN_CITY_ALIASES: Record<string, string> = {
  'ת"א': 'תל אביב - יפו',
  'תל אביב': 'תל אביב - יפו',
  'תל אביב יפו': 'תל אביב - יפו',
  'י-ם': 'ירושלים',
  "י\"ם": 'ירושלים',
};
