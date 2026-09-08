export const CITIES_QUERY_KEYS = {
  directory: () => ['cities', 'directory'] as const,
};

export const PAGE_TITLE = 'כל הערים';
export const ORDER_LABEL = 'לפי אזור';

// The spec labels this gap `xs`, but the design system's `xs` is 4px and the
// stated total (60 = 36 + 22 + gap) only resolves at 2px, so the measured
// value wins over the mislabelled token name.
export const TITLE_GAP = '2px';

export const LOAD_ERROR_HEADING = 'לא הצלחנו לטעון את רשימת הערים';
export const LOAD_ERROR_BODY = 'משהו השתבש בדרך אלינו. אפשר לנסות שוב.';
export const RETRY_LABEL = 'נסו שוב';

export const BOARD_EMPTY_HEADING = 'עדיין אין ערים בלוח';
export const BOARD_EMPTY_BODY = 'ברגע שיתווסף שיעור ראשון, העיר שלו תופיע כאן. אם אתם מכירים שיעור, כתבו לנו.';
export const CONTACT_US_LABEL = 'כתבו לנו';

// Off the 4px spacing scale, and the spec names it as such: "not a spacing
// token, and it is the one off-scale value in this page" (design spec,
// "Phone, loaded").
export const AREA_BLOCK_GAP = '28px';

// Two placeholder area blocks, per the measured loading frame (96:2). Stable
// keys rather than the array index, matching the shipped skeleton convention
// (HomePage/components/HomeRails/components/RailSkeleton).
export const AREA_SKELETON_KEYS = ['area-1', 'area-2'] as const;
