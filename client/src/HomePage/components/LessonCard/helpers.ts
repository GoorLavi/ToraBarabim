import type { LessonOccurrence } from '@torabarabim/common';

import { CANCELLED_LABEL, LESSON_AUDIENCE_LABELS, LESSON_TOPIC_LABELS, cardWeekday } from './consts';

// The audience is required on the wire today (`LessonOccurrence.audience`
// is not optional), so there is no "unfilled" case to guard here yet.
// design-system.md describes an "audience not filled in" state for a
// future, more permissive schema; that is a `common` type change, not a
// client one, and is noted as a follow-up in this slice's report.

// Both title and topic are individually optional (an admin entering a
// lesson does not always know the topic), so the short description picks
// whichever is present and is `undefined`, never an empty string, when
// neither is: a missing piece must render nothing, not a stray separator.
export const descriptionLabel = (lesson: LessonOccurrence): string | undefined =>
  lesson.title ?? (lesson.topic ? LESSON_TOPIC_LABELS[lesson.topic] : undefined);

// The client route for a single occurrence (client/src/App/App.tsx).
export const lessonCardHref = (lesson: LessonOccurrence): string => `/lesson/${lesson.lessonId}/${lesson.date}`;

// The card's visible text runs together into one accessible name without
// this: "יום א׳21:00הרב יעקב מזרחיגברים · מבוא..." (design review nit). Built
// as real, comma-separated sentence fragments instead.
export const cardAriaLabel = (lesson: LessonOccurrence): string => {
  const teachingRabbi = lesson.substituteRabbi ?? lesson.rabbi;
  const description = descriptionLabel(lesson);

  const parts = [
    teachingRabbi.name,
    `${cardWeekday(lesson.date)} בשעה ${lesson.startTime}`,
    LESSON_AUDIENCE_LABELS[lesson.audience],
  ];
  if (description) parts.push(description);
  parts.push(lesson.place.city);
  if (lesson.status === 'cancelled') parts.push(CANCELLED_LABEL);

  return parts.join(', ');
};
