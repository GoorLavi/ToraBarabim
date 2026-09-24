export const COURSE_PAGE_QUERY_KEYS = {
  detail: (courseId: string) => ['course', courseId] as const,
};

// A 404 never becomes a 200 by retrying, so only network/5xx failures get a
// second attempt (mirrors LessonPage/consts.ts, LESSON_PAGE_RETRY_LIMIT).
export const COURSE_PAGE_RETRY_LIMIT = 1;

export const BACK_TO_HOME_LABEL = 'חזרה לעמוד הבית';

export const NOT_FOUND_HEADING = 'לא מצאנו את הקורס הזה';
export const NOT_FOUND_EXPLANATION = 'ייתכן שהקורס הוסר, או שהקישור לא מדויק.';

export const SERVER_ERROR_HEADING = 'לא הצלחנו לטעון את הקורס';
export const SERVER_ERROR_EXPLANATION = 'משהו השתבש בדרך אלינו. אפשר לנסות שוב.';
export const RETRY_LABEL = 'נסו שוב';

// Facts list labels, after the editor (spec section 13): nouns throughout,
// not "איפה"/"למי", so the five labels are one grammatical kind.
export const FACT_OPENING_LABEL = 'פתיחה';
export const FACT_SCOPE_LABEL = 'היקף';
export const FACT_VENUE_LABEL = 'מקום';
export const FACT_AUDIENCE_LABEL = 'קהל';
export const FACT_PRICE_LABEL = 'מחיר';

export const cycleLabel = (cycle: number): string => `מחזור ${cycle}`;

export const CONTACT_BAR_WHATSAPP_LABEL = 'וואטסאפ';
export const CONTACT_BAR_CALL_LABEL = 'שיחה';

// The course's own WhatsApp opening line (spec section 8), naming the
// course, never a person, so it reads the same whether or not a rabbi is
// linked.
export const whatsAppMessage = (courseName: string): string => `שלום, ראיתי באתר תורה ברבים את הקורס "${courseName}" ואשמח לשמוע פרטים נוספים.`;
