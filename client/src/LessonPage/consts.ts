import type { RabbiHonorific } from '@torabarabim/common';

export const LESSON_PAGE_QUERY_KEYS = {
  occurrence: (lessonId: string, date: string) => ['lesson-occurrence', lessonId, date] as const,
};

// Bounds the loading skeleton the same way HomePage/consts.ts does: a 404
// never becomes a 200 by retrying, so only network/5xx failures get a
// second attempt (useLessonOccurrence.ts).
export const LESSON_PAGE_RETRY_LIMIT = 1;

export const NOT_FOUND_HEADING = 'לא מצאנו את השיעור הזה';
export const NOT_FOUND_EXPLANATION = 'ייתכן שהשיעור הוסר או שאין שיעור בתאריך הזה. אפשר לחפש שיעור אחר בין כל השיעורים באתר.';

// An error is transient, so its copy offers a retry rather than the
// not-found screen's way out (design spec, frame 63:2).
export const SERVER_ERROR_HEADING = 'לא הצלחנו לטעון את השיעור';
export const SERVER_ERROR_EXPLANATION = 'משהו השתבש בדרך אלינו. אפשר לנסות שוב.';
export const RETRY_LABEL = 'נסו שוב';

export const ALL_LESSONS_LABEL = 'לכל השיעורים';
export const BACK_TO_ALL_LESSONS_LABEL = 'חזרה לכל השיעורים';

// The label above the rabbi's name in the ticket's lower panel (LessonTicket):
// the ordinary role label, and what it becomes when a substitute is teaching.
// Keyed by the teaching rabbi's own honorific (the substitute's, when there
// is one), never the lesson's original rabbi, so a `Record` here means a new
// honorific fails the build until both forms are written.
export const TEACHING_RABBI_ROLE_LABEL: Record<RabbiHonorific, string> = {
  rav: 'מגיד השיעור',
  rabbanit: 'מגידת השיעור',
};
export const SUBSTITUTE_ROLE_LABEL: Record<RabbiHonorific, string> = {
  rav: 'הפעם מגיד השיעור',
  rabbanit: 'הפעם מגידת השיעור',
};

// Takes an already-composed display name (`rabbiDisplayName`), so this
// never prepends the honorific a second time.
export const originalRabbiTagLabel = (displayName: string): string => `במקום ${displayName}`;

export const otherLessonsInCityLabel = (city: string): string => `לשיעורים אחרים ב${city}`;
export const NO_REASON_GIVEN_LABEL = 'לא נמסרה סיבה';
export const CANCELLED_HEADING_LABEL = 'השיעור מבוטל בתאריך הזה';
