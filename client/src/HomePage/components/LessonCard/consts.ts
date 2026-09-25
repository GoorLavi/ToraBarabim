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
