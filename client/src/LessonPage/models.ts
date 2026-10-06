import type { LessonOccurrence, OccurrenceTiming } from '@torabarabim/common';

export interface LessonPageProps {
  className?: string;
  // The rabbi row's lessons. Deferred, never awaited by the loader or the
  // page: the ticket must never wait on this read. Resolved inside
  // `DeferredLessonRail`'s own `Suspense` boundary. Its title and link are
  // built here from the occurrence already in the query, so they paint at
  // once.
  rabbiLessons: Promise<DeferredLessons>;
  // The name and slug arrive synchronously from the loader
  // (routes/lesson.server.ts); only `lessons` is deferred, for the same
  // reason as `rabbiLessons`.
  areaPreview: AreaPreview;
}

// Frozen contract with the loader (routes/lesson.server.ts). `areaName` and
// `areaSlug` are known before the area read runs, so the section heading and
// its loading skeleton can paint immediately.
export interface AreaPreview {
  areaName: string;
  areaSlug: string;
  lessons: Promise<DeferredLessons>;
}

// `ready` with an empty `items` is the empty state (renders a StateCard);
// `unavailable` means the read itself failed and is a separate case, so the
// page never prints "no other lessons" when the truth is "we could not find
// out".
export type DeferredLessons = { kind: 'ready'; items: LessonOccurrence[] } | { kind: 'unavailable' };

// Which tense the teaching rabbi's role label is written in. A cancelled date
// is `cancelledPast` only once it is past; a cancelled date still ahead reads
// as an ordinary upcoming one.
export type RoleTense = OccurrenceTiming | 'cancelledPast';

// What a page-level notice can announce: every timing except the ordinary one.
export type PastNoticeTiming = Exclude<OccurrenceTiming, 'upcoming'>;

// Which of the two actions under the ticket the occurrence offers.
export interface LessonActionsAvailability {
  canShare: boolean;
  canAddToCalendar: boolean;
}
