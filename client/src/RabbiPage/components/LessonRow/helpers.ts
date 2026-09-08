import type { LessonOccurrence } from '@torabarabim/common';

import { LESSON_AUDIENCE_LABELS, LESSON_TOPIC_LABELS } from '~/HomePage/components/LessonCard/consts';

// The rabbi is already known on their own page, so the row's title is the
// lesson's own title or topic, never the rabbi's name (unlike LessonCard,
// which uses the same fallback for a different line). Mirrors LessonCard's
// descriptionLabel (HomePage/components/LessonCard/helpers.ts): both title
// and topic are individually optional, so a missing one renders nothing
// rather than a stray separator.
export const rowTitle = (lesson: LessonOccurrence): string | undefined =>
  lesson.title ?? (lesson.topic ? LESSON_TOPIC_LABELS[lesson.topic] : undefined);

// `audience · venue, city` (design spec, "Line 3 copy"). Venue and city are
// both required on `Place`, so only the leading audience segment can ever
// be the sole content.
export const rowVenueLine = (lesson: LessonOccurrence): string =>
  `${LESSON_AUDIENCE_LABELS[lesson.audience]} · ${lesson.place.name}, ${lesson.place.city}`;
