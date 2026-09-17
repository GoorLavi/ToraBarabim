import type { LessonResponse } from '@torabarabim/common';

import { recurrenceWhenLabel } from '~/AdminPanel/helpers';

// One `Secondary` line for an inline lesson row: weekday (or date), start
// time and city joined with ` · `, e.g. "כל יום שלישי · 20:30 · בני ברק".
// The separator goes at both joints, not just before the city: a one-time
// lesson renders its date as digits, and a bare space between that and the
// start time leaves two numeric runs adjacent on a line that can wrap
// between them (design-system.md, "a number at a line break flips").
// Single caller, stays local (root CLAUDE.md, Scope and Boundaries).
export const lessonRowMetaLabel = (lesson: LessonResponse): string =>
  `${recurrenceWhenLabel(lesson)} · ${lesson.startTime} · ${lesson.place.cityName}`;
