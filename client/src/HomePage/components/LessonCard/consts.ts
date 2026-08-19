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

// The floor from design-system.md, Type ("the card title steps down to
// 15 / 21... in a two-column poster grid on a phone, roughly 173px wide")
// is a property of the card's own rendered width, not of the viewport: a
// rail card can be 200px wide on the same 375px phone. Stepped with
// `@container` in styles.ts instead of a viewport media query.
export const CARD_WIDE_THRESHOLD = '190px';

const weekdayFormatter = new Intl.DateTimeFormat('he-IL', { weekday: 'short', timeZone: 'Asia/Jerusalem' });

export const cardWeekday = (isoDate: string): string => weekdayFormatter.format(new Date(`${isoDate}T00:00:00Z`));
