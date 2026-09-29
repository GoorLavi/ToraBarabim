// A course stays listed for a week after registration closes (by the
// calendar, by hand, or marked full), then leaves every list but keeps its
// own page. Confirmed by the owner: "קורס יורד שבוע אחרי שההרשמה נסגרה".
export const CLOSED_WEEK_DAYS = 7;

export const COURSE_GALLERY_MAX_PHOTOS = 8;

// The owner's call at his hand run: a course photo of any size is accepted,
// never refused for being small ("לקבל כל גודל, עם אזהרה על טשטוש"). Nothing
// on the server reads these: they are the soft thresholds the client mirrors
// (`client/src/consts.ts`) to warn about blur before upload, sized to the
// card's own render (600 by 800) and the gallery rail's widest tier.
export const COURSE_COVER_SOFT_MIN_WIDTH = 600;
export const COURSE_COVER_SOFT_MIN_HEIGHT = 800;
export const COURSE_GALLERY_SOFT_MIN_SIDE = 600;

export const COURSE_NAME_MAX_LENGTH = 120;
export const COURSE_DESCRIPTION_MAX_LENGTH = 4000;
export const COURSE_TEACHER_NAME_MAX_LENGTH = 120;
export const COURSE_TOPIC_OTHER_MAX_LENGTH = 120;

export const COURSE_WEEKS_MIN = 1;
export const COURSE_WEEKS_MAX = 104;
export const COURSE_SESSIONS_MIN = 1;
export const COURSE_SESSIONS_MAX = 500;
export const COURSE_HOURS_MIN = 1;
export const COURSE_HOURS_MAX = 2000;
export const COURSE_CYCLE_MIN = 1;
export const COURSE_CYCLE_MAX = 999;

// Never 0: a price of zero would read as a free course, which the owner
// explicitly refused ("גם אם רושמים 0 שקל אל תרשום קורס חינם").
export const COURSE_PRICE_MIN = 1;
export const COURSE_PRICE_MAX = 100_000;

export const DEFAULT_COURSE_PAGE = 1;
export const DEFAULT_COURSE_PAGE_SIZE = 20;
export const MAX_COURSE_PAGE_SIZE = 50;
