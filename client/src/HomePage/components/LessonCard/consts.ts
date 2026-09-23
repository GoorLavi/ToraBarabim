import type { LessonTopic } from '@torabarabim/common';

import posterShtenderWindow from '~/assets/lessonFallbackPosters/lesson-fallback-01-shtender-window.webp';
import posterBindingsShelf from '~/assets/lessonFallbackPosters/lesson-fallback-02-bindings-shelf.webp';
import posterBookcaseBrass from '~/assets/lessonFallbackPosters/lesson-fallback-03-bookcase-brass.webp';
import posterDeskQuill from '~/assets/lessonFallbackPosters/lesson-fallback-04-desk-quill.webp';
import posterLeatherCover from '~/assets/lessonFallbackPosters/lesson-fallback-05-leather-cover.webp';
import posterBeitMidrashShtender from '~/assets/lessonFallbackPosters/lesson-fallback-06-beit-midrash-shtender.webp';

export const CANCELLED_LABEL = 'מבוטל השבוע';
// The prefix before the substituted rabbi's name; the honorific-aware part
// that follows comes from `SUBSTITUTE_PREFIX_BY_HONORIFIC` (~/consts.ts).
export const SUBSTITUTE_LABEL = 'הפעם';

// Non-breaking spaces on both sides of the dot, so the meta line's
// description never wraps with the dot left dangling alone at a line's end
// (design review, card meta at 375).
export const META_SEPARATOR = ' · ';

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
// 15 / 21... in a two-column poster grid on a phone, roughly 171px wide")
// is a property of the card's own rendered width, not of the viewport: a
// rail card can be 200px wide on the same 375px phone. Stepped with
// `@container` in styles.ts instead of a viewport media query.
export const CARD_WIDE_THRESHOLD = '190px';

// Below this, the cancellation label and the medallion cannot both sit at
// the poster's top edge without colliding (design review): the label drops
// to the bottom corner instead, still stepped by the card's own rendered
// width via `@container`, not the viewport. A different value from
// `CARD_WIDE_THRESHOLD` on purpose: that one is about the type scale's own
// floor, this one is about two fixed-size corner marks fitting side by side.
export const CANCELLED_LABEL_BOTTOM_THRESHOLD = '200px';

const weekdayFormatter = new Intl.DateTimeFormat('he-IL', { weekday: 'short', timeZone: 'Asia/Jerusalem' });

export const cardWeekday = (isoDate: string): string => weekdayFormatter.format(new Date(`${isoDate}T00:00:00Z`));

export const FALLBACK_POSTERS = [
  posterShtenderWindow,
  posterBindingsShelf,
  posterBookcaseBrass,
  posterDeskQuill,
  posterLeatherCover,
  posterBeitMidrashShtender,
];
