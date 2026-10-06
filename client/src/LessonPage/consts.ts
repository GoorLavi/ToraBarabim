import type { RabbiHonorific, Weekday } from '@torabarabim/common';

import type { PastNoticeTiming, RoleTense } from './models';

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

// The label above the rabbi's name in the ticket's lower panel (LessonTicket).
// A `Record` so a new honorific or tense fails the build until its form is
// written. A rav's label is the same noun in every tense.
export const TEACHING_RABBI_ROLE_LABEL: Record<RabbiHonorific, Record<RoleTense, string>> = {
  rav: {
    upcoming: 'מגיד השיעור',
    startedPastGrace: 'מגיד השיעור',
    tookPlace: 'מגיד השיעור',
    cancelledPast: 'מגיד השיעור',
  },
  rabbanit: {
    upcoming: 'תעביר את השיעור',
    startedPastGrace: 'מעבירה את השיעור',
    tookPlace: 'העבירה את השיעור',
    cancelledPast: 'הייתה אמורה להעביר את השיעור',
  },
};

// The ticket's notice for a date that is no longer ahead. A cancellation
// shows its own banner instead, never both.
export const PAST_NOTICE_LABEL: Record<PastNoticeTiming, string> = {
  startedPastGrace: 'השיעור הזה כבר התחיל',
  tookPlace: 'השיעור הזה כבר התקיים',
};

export const otherLessonsInCityLabel = (city: string): string => `לשיעורים אחרים ב${city}`;
export const NO_REASON_GIVEN_LABEL = 'לא נמסרה סיבה';
export const CANCELLED_HEADING_LABEL = 'השיעור מבוטל בתאריך הזה';

// Trimmed to drop the area name: the section's heading link (RailHeading)
// already names the area directly above this card, so repeating it here would
// rebuild the duplication the heading-plus-link rework just removed.
export const AREA_RAIL_EMPTY_HEADING = 'אין שיעורים נוספים בשבוע הקרוב';
export const RABBI_RAIL_EMPTY_HEADING = 'אין כרגע שיעורים קרובים';
// Shared by both rows: the same hope, whichever question the row answers.
export const RAIL_EMPTY_BODY = 'ייתכן שיתווספו שיעורים בקרוב.';

export const rabbiRailTitle = (rabbiName: string): string => `לכל השיעורים של ${rabbiName}`;

// The width running text (the note, the bio, and the skeleton standing in for
// them) caps at, even inside the wider desktop column.
export const RUNNING_TEXT_MAX_INLINE_SIZE = '640px';

export const AT_TIME_PREFIX = 'בשעה';

// A single Saturday is "כל שבת", never "כל יום שבת".
export const SATURDAY: Weekday = 6;

export const EVERY_SATURDAY_LABEL = 'כל שבת';
export const everyWeekdayLabel = (bareWeekdayName: string): string => `כל יום ${bareWeekdayName}`;
export const onWeekdaysLabel = (joinedBareWeekdayNames: string): string => `בימי ${joinedBareWeekdayNames}`;
