import type { LessonOccurrence } from '@torabarabim/common';

import { LESSON_TOPIC_LABELS } from './consts';

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
