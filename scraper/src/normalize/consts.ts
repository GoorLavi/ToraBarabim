import type { LessonAudience, LessonTopic, Weekday } from '@torabarabim/common';

// Full names and the single-letter forms sites use for "יום א'" style
// listings. מוצ"ש (motzei Shabbat) still falls on Saturday's Gregorian
// date, so it maps to the same weekday as שבת.
export const WEEKDAY_NAMES: Record<string, Weekday> = {
  'ראשון': 0,
  'שני': 1,
  'שלישי': 2,
  'רביעי': 3,
  'חמישי': 4,
  'שישי': 5,
  'שבת': 6,
  'מוצש': 6,
  'מוצאי שבת': 6,
  'א': 0,
  'ב': 1,
  'ג': 2,
  'ד': 3,
  'ה': 4,
  'ו': 5,
  'ש': 6,
};

// Order matters: an "open women's section" note describes a men's lesson a
// woman may also attend, not a women's lesson, so it must be matched before
// the plain נשים pattern below or it is misread as 'women'.
export const AUDIENCE_KEYWORDS: Array<{ pattern: RegExp; audience: LessonAudience }> = [
  { pattern: /עזרת נשים פתוחה/, audience: 'mixed' },
  { pattern: /נשים/, audience: 'women' },
  { pattern: /גברים/, audience: 'men' },
  { pattern: /(לכולם|לכל הציבור|מעורב)/, audience: 'mixed' },
];

export const TOPIC_KEYWORDS: Array<{ pattern: RegExp; topic: LessonTopic }> = [
  { pattern: /גמרא|תלמוד/, topic: 'gemara' },
  { pattern: /הלכה/, topic: 'halacha' },
  { pattern: /פרש(ת|ה)/, topic: 'parasha' },
  { pattern: /מוסר/, topic: 'mussar' },
  { pattern: /חסידות/, topic: 'chassidut' },
  { pattern: /תנ"?ך/, topic: 'tanach' },
  { pattern: /מחשבה/, topic: 'machshava' },
];

// How far a yearless date such as "9.8" may resolve from the reference date
// it is read against before it is considered ambiguous and dropped rather
// than guessed. A schedule poster describes the week it covers, so a
// resolved date this far off almost certainly means the text did not parse
// as a day/month at all.
export const MAX_YEARLESS_DATE_SPAN_DAYS = 200;

// Straight and curly quote and geresh/gershayim variants, dropped entirely
// when comparing city names since their presence is a stylistic choice, not
// a distinguishing part of the name.
export const CITY_QUOTE_CHARS = /["'‘’“”׳״]/g;

// An official city name that lists a second name after a hyphen, such as
// "תל אביב - יפו", so a source that writes only the first part still
// matches. The separator is a hyphen with a space on each side.
export const CITY_SUFFIX_SEPARATOR = /\s-\s.*$/;

// Full versus defective Hebrew spelling of the same letter used as a long
// vowel, e.g. "תקווה" versus "תקוה" and "קריית" versus "קרית": collapsing a
// run of the same letter to one occurrence makes both spellings compare
// equal.
export const CITY_DOUBLED_LETTERS = /([וי])\1+/g;
