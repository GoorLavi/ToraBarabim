// A course stays listed for a week after registration closes (by the
// calendar, by hand, or marked full), then leaves every list but keeps its
// own page. Confirmed by the owner: "קורס יורד שבוע אחרי שההרשמה נסגרה".
export const CLOSED_WEEK_DAYS = 7;

export const COURSE_GALLERY_MAX_PHOTOS = 8;

// The cover goes through the rabbi poster's own picker and shares its floor:
// 900 by 1200, width and height, matching the poster crop the designer's
// frame names. A gallery photo is never cropped, so it keeps the lighter
// shorter-side floor: the widest rail tier is 296 CSS px, 592 device px at
// 2x, and a higher floor would refuse WhatsApp-compressed flyers. Both are
// hand-mirrored in the client (`client/src/consts.ts`).
export const COURSE_COVER_MIN_WIDTH = 900;
export const COURSE_COVER_MIN_HEIGHT = 1200;
export const COURSE_GALLERY_PHOTO_MIN_SIDE = 600;

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
