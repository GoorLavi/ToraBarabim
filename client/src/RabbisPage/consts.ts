export const RABBIS_QUERY_KEYS = {
  all: () => ['rabbis', 'directory'] as const,
};

// Mirrors the server's MAX_PAGE_SIZE (server/src/service/shared/consts.ts):
// the index has no pagination control, so it always asks for the largest
// page the server accepts to finish loading the whole directory in as few
// requests as possible.
export const RABBI_DIRECTORY_PAGE_SIZE = 50;

export const PAGE_TITLE = 'כל הרבנים';
export const ORDER_LABEL = 'לפי סדר האלף־בית';

// Off the 4px spacing scale (design spec, "content column": "gap between
// blocks... 20 on the all-rabbis and all-lessons pages").
export const CONTENT_GAP = '20px';

// The spec labels this gap `xs`, but the design system's `xs` is 4px and the
// stated total (60 = 36 + 22 + gap) only resolves at 2px, so the measured
// value wins over the mislabelled token name.
export const TITLE_GAP = '2px';

export const LOAD_ERROR_HEADING = 'לא הצלחנו לטעון את רשימת הרבנים';
export const LOAD_ERROR_BODY = 'משהו השתבש בדרך אלינו. אפשר לנסות שוב.';
export const RETRY_LABEL = 'נסו שוב';

export const BOARD_EMPTY_HEADING = 'עדיין אין רבנים בלוח';
export const BOARD_EMPTY_BODY = 'הלוח נבנה בימים אלה. אם אתם מכירים שיעור, כתבו לנו ונוסיף אותו.';
export const CONTACT_US_LABEL = 'כתבו לנו';

export const NO_RESULTS_SUBLINE = 'לא נמצאו תוצאות';
export const NO_RESULTS_BODY = 'אולי השם כתוב אצלנו קצת אחרת. אפשר לנקות את החיפוש ולעבור על כל הרשימה.';
export const NO_RESULTS_HEADING_PREFIX = 'לא מצאנו רב בשם ';
export const CLEAR_SEARCH_LABEL = 'ניקוי החיפוש';

// Six placeholder rows, per the measured loading frame (94:73). Stable keys
// rather than the array index, matching the shipped skeleton convention
// (HomePage/components/HomeRails/components/RailSkeleton).
export const ROW_SKELETON_KEYS = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6'] as const;
