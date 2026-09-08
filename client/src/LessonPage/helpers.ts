import type { LessonOccurrence, Rabbi } from '@torabarabim/common';

import type { LessonPageApiError } from './api';
import * as consts from './consts';

// A 404 is a fact about the lesson, so its screen offers a way out. Every
// other failure is transient, so its screen offers a retry instead: the two
// are never the same screen even though they share a shape (LessonPage.tsx).
export type LessonErrorCopy =
  | { kind: 'not-found'; heading: string; explanation: string }
  | { kind: 'error'; heading: string; explanation: string };

// Status-aware, per client/CLAUDE.md: reads `error.status`, never the raw
// server message. A removed lesson and a bad date both arrive as 404 and
// are shown identically (server/src/api/lessons/index.ts); everything else
// is a generic "could not load" screen.
export const lessonErrorCopy = (error: LessonPageApiError | null): LessonErrorCopy => {
  if (error?.status === 404) {
    return { kind: 'not-found', heading: consts.NOT_FOUND_HEADING, explanation: consts.NOT_FOUND_EXPLANATION };
  }
  return { kind: 'error', heading: consts.SERVER_ERROR_HEADING, explanation: consts.SERVER_ERROR_EXPLANATION };
};

// The substitute teaches this occurrence when one is assigned; otherwise
// it is the lesson's own rabbi. Shared by `LessonTicket` and `LessonDetails`.
export const teachingRabbiOf = (occurrence: LessonOccurrence): Rabbi => occurrence.substituteRabbi ?? occurrence.rabbi;

// There is no city id on a resolved `Place` (common/src/place.ts), only its
// name, so the best honest link back is a text search for it rather than a
// structured city filter.
export const otherLessonsInCityHref = (city: string): string => `/?q=${encodeURIComponent(city)}`;
