import type { LessonResponse } from '@torabarabim/common';

import { recurrenceWhenLabel } from '~/AdminPanel/helpers';

// One `Secondary` line for an inline lesson row: weekday (or date), start
// time and city joined with ` · `, e.g. "כל יום שלישי 20:30 · בני ברק".
// Single caller, stays local (root CLAUDE.md, Scope and Boundaries).
export const lessonRowMetaLabel = (lesson: LessonResponse): string =>
  `${recurrenceWhenLabel(lesson)} ${lesson.startTime} · ${lesson.place.cityName}`;
