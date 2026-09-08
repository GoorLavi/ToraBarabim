export const BACK_TO_ALL_RABBIS_LABEL = 'חזרה לכל הרבנים';

export const RABBI_PAGE_QUERY_KEYS = {
  detail: (rabbiId: string) => ['rabbi', rabbiId] as const,
  lessons: (rabbiId: string) => ['rabbi', rabbiId, 'lessons'] as const,
  // Not parameterised by rabbiId: this is the "lessons across the whole
  // country" fallback, fetched once no matter which rabbi's page asked for
  // it (design spec, "the empty state widens to the whole country").
  nationwideLessons: () => ['rabbi', 'nationwide-lessons'] as const,
};

// A 404 never becomes a 200 by retrying, so only network/5xx failures get a
// second attempt (mirrors LessonPage/consts.ts, LESSON_PAGE_RETRY_LIMIT).
export const RABBI_PAGE_RETRY_LIMIT = 1;

// The empty state's widened grid: a real two-column grid of the nearest
// lessons nationwide, capped small since it is a fallback, not a listing
// (design spec, "A real two-column lesson grid").
export const NATIONWIDE_LESSONS_PAGE_SIZE = 4;

export const ERROR_HEADING = 'לא הצלחנו לטעון את עמוד הרב';
export const ERROR_BODY = 'משהו השתבש בדרך אלינו. אפשר לנסות שוב.';
export const RETRY_LABEL = 'נסו שוב';

export const NOT_FOUND_HEADING = 'לא מצאנו את הרב הזה';
export const NOT_FOUND_BODY = 'ייתכן שהעמוד הוסר, או שהקישור לא מדויק.';
export const ALL_RABBIS_LABEL = 'לכל הרבנים';

export const NO_LESSONS_META_LABEL = 'אין כרגע שיעורים בלוח';

export const LESSONS_HEADING = 'השיעורים';
export const LESSONS_SUBHEADING = 'לפי המועד הקרוב';

export const NATIONWIDE_LESSONS_HEADING = 'שיעורים קרובים';
export const NATIONWIDE_LESSONS_SUBHEADING = 'בכל הארץ';

export const CONTACT_US_LABEL = 'כתבו לנו';

// Built as `אין כרגע שיעורים של ` + rabbi.name, never a gendered verb, so it
// survives `הרבנית שרה גולדברג` unchanged (design spec, the one copy defect
// callout: never build a heading from a gendered verb).
export const noLessonsHeading = (rabbiName: string): string => `אין כרגע שיעורים של ${rabbiName}`;

// The drawn frame carries `שלו`, which does not survive a female rabbi. No
// gender field exists on `Rabbi` to derive the correct pronoun from, so this
// is the one genderless string used for every rabbi (design spec, "the one
// place in the round where the copy as drawn is not safe for the real
// data").
export const NO_LESSONS_BODY =
  'ייתכן שהשיעורים עוד לא עודכנו אצלנו. אם אתם מכירים שיעור, כתבו לנו ונוסיף אותו.';

export const lessonCountLabel = (count: number): string => (count === 1 ? 'שיעור אחד' : `${count} שיעורים`);
