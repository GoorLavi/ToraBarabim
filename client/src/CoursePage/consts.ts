export const COURSE_PAGE_QUERY_KEYS = {
  detail: (courseId: string) => ['course', courseId] as const,
};

// A 404 never becomes a 200 by retrying, so only network/5xx failures get a
// second attempt (mirrors LessonPage/consts.ts, LESSON_PAGE_RETRY_LIMIT).
export const COURSE_PAGE_RETRY_LIMIT = 1;

export const BACK_TO_HOME_LABEL = 'לעמוד הבית';

export const NOT_FOUND_HEADING = 'לא מצאנו את הקורס הזה';
export const NOT_FOUND_EXPLANATION = 'ייתכן שהקורס הוסר או שהקישור לא מדויק.';

export const SERVER_ERROR_HEADING = 'לא הצלחנו לטעון את פרטי הקורס';
export const SERVER_ERROR_EXPLANATION = 'משהו השתבש בדרך אלינו. אפשר לנסות שוב.';
export const RETRY_LABEL = 'נסו שוב';

// "מחזור" and its number are joined with a no-break space (design brief B,
// item 3).
export const cycleLabel = (cycle: number): string => `מחזור ${cycle}`;

export const ABOUT_COURSE_HEADING = 'על הקורס';

export const CONTACT_BAR_WHATSAPP_LABEL = 'וואטסאפ';
export const CONTACT_BAR_CALL_LABEL = 'שיחה';

// The side card's own fuller treatment (design brief A, item 12), the
// dedication window's own wording: the roomier desktop card affords it
// where the phone's fixed bar cannot.
export const REGISTRATION_LABEL = 'להרשמה';
export const WHATSAPP_FULL_LABEL = 'שליחת הודעה בוואטסאפ';

// The course's own WhatsApp opening line (spec section 8), naming the
// course, never a person, so it reads the same whether or not a rabbi is
// linked.
export const whatsAppMessage = (courseName: string): string => `שלום, ראיתי באתר תורה ברבים את הקורס "${courseName}" ואשמח לשמוע פרטים נוספים.`;
