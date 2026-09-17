import type { DirectoryCopy, RabbiDirectory } from './models';

export const RABBIS_QUERY_KEYS = {
  directory: (directory: RabbiDirectory) => ['rabbis', 'directory', directory] as const,
};

// Mirrors the server's MAX_PAGE_SIZE (server/src/service/shared/consts.ts):
// the index has no pagination control, so it always asks for the largest
// page the server accepts to finish loading the whole directory in as few
// requests as possible.
export const RABBI_DIRECTORY_PAGE_SIZE = 50;

export const SEARCH_FIELD_ID = 'rabbis-search-field';

// One copy table per directory, rather than a second page component:
// /rabbis lists ravs, /women/rabbaniyot lists rabbaniyot, and only the
// wording differs.
export const DIRECTORY_COPY: Record<RabbiDirectory, DirectoryCopy> = {
  rabbis: {
    pageTitle: 'כל הרבנים',
    searchFieldLabel: 'חיפוש בתוך הרבנים',
    searchInputAriaLabel: 'חיפוש רב לפי שם',
    noResultsHeadingPrefix: 'לא מצאנו תוצאות עבור "',
    noResultsHeadingSuffix: '"',
    boardEmptyHeading: 'עדיין אין רבנים בלוח',
    boardEmptyBody: 'הלוח נבנה בימים אלה. אם אתם מכירים שיעור, כתבו לנו ונוסיף אותו.',
    loadErrorHeading: 'לא הצלחנו לטעון את רשימת הרבנים',
  },
  rabbaniyot: {
    pageTitle: 'כל הרבניות',
    searchFieldLabel: 'חיפוש רבנית',
    searchInputAriaLabel: 'חיפוש רבנית לפי שם',
    noResultsHeadingPrefix: 'לא מצאנו רבנית שמתאימה ל"',
    noResultsHeadingSuffix: '"',
    boardEmptyHeading: 'עדיין אין רבניות בלוח',
    boardEmptyBody: 'הלוח עוד בבנייה. אם אתן מכירות שיעור של רבנית, כתבו לנו. אנחנו בודקים כל שיעור לפני שהוא עולה ללוח.',
    loadErrorHeading: 'לא הצלחנו לטעון את רשימת הרבניות',
  },
};

// Off the 4px spacing scale (design spec, "content column": "gap between
// blocks... 20 on the all-rabbis and all-lessons pages").
export const CONTENT_GAP = '20px';

// The spec labels this gap `xs`, but the design system's `xs` is 4px and the
// stated total (60 = 36 + 22 + gap) only resolves at 2px, so the measured
// value wins over the mislabelled token name.
export const TITLE_GAP = '2px';

export const LOAD_ERROR_BODY = 'משהו השתבש בדרך אלינו. אפשר לנסות שוב.';
export const RETRY_LABEL = 'נסו שוב';

export const CONTACT_US_LABEL = 'כתבו לנו';

export const NO_RESULTS_SUBLINE = 'לא נמצאו תוצאות';
export const NO_RESULTS_BODY = 'אולי השם כתוב אצלנו קצת אחרת. אפשר לנקות את החיפוש ולעבור על כל הרשימה.';
export const CLEAR_SEARCH_LABEL = 'ניקוי החיפוש';

// Six placeholder rows, per the measured loading frame (94:73). Stable keys
// rather than the array index, matching the shipped skeleton convention
// (HomePage/components/HomeRails/components/RailSkeleton).
export const ROW_SKELETON_KEYS = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6'] as const;
