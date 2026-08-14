import type { LessonAudience, LessonTopic } from '@torabarabim/common';

export const CANCELLED_LABEL = 'מבוטל השבוע';
export const SUBSTITUTE_LABEL = 'הפעם במקום';

// The forbidden couple-oriented terms never appear in this product
// (design-system.md, "Audience wording"): the three values below are exact
// and final, and the mixed-audience wording is spelled out rather than a
// single loaded word.
export const LESSON_AUDIENCE_LABELS: Record<LessonAudience, string> = {
  men: 'גברים',
  women: 'נשים',
  mixed: 'גם גברים וגם נשים',
};

export const LESSON_TOPIC_LABELS: Record<LessonTopic, string> = {
  gemara: 'גמרא',
  halacha: 'הלכה',
  parasha: 'פרשת השבוע',
  mussar: 'מוסר',
  chassidut: 'חסידות',
  tanach: 'תנ״ך',
  machshava: 'מחשבה',
  other: 'כללי',
};

const weekdayFormatter = new Intl.DateTimeFormat('he-IL', { weekday: 'short', timeZone: 'Asia/Jerusalem' });

export const cardWeekday = (isoDate: string): string => weekdayFormatter.format(new Date(`${isoDate}T00:00:00Z`));
