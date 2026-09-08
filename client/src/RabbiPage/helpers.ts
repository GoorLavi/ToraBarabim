import type { LessonOccurrence, RabbiDetailResponse } from '@torabarabim/common';

import type { RabbiPageApiError } from './api';
import * as consts from './consts';

// A 404 is a fact about the rabbi, so its screen offers a way out. Every
// other failure is transient, so its screen offers a retry (mirrors
// LessonPage/helpers.ts, lessonErrorCopy).
export type RabbiErrorCopy =
  | { kind: 'not-found'; heading: string; body: string }
  | { kind: 'error'; heading: string; body: string };

export const rabbiErrorCopy = (error: RabbiPageApiError | null): RabbiErrorCopy => {
  if (error?.status === 404) {
    return { kind: 'not-found', heading: consts.NOT_FOUND_HEADING, body: consts.NOT_FOUND_BODY };
  }
  return { kind: 'error', heading: consts.ERROR_HEADING, body: consts.ERROR_BODY };
};

// The hero meta line: lesson count and city count, both built once here so
// the "no lessons" case is not a third, hand-written variant elsewhere
// (design spec, "Meta line copy").
export const rabbiMetaLabel = (rabbi: RabbiDetailResponse): string => {
  if (rabbi.lessonCount === 0) return consts.NO_LESSONS_META_LABEL;

  const lessonsPart = consts.lessonCountLabel(rabbi.lessonCount);
  const [onlyCity] = rabbi.cities;
  if (rabbi.cities.length === 1 && onlyCity) return `${lessonsPart} · ${onlyCity.name}`;
  if (rabbi.cities.length >= 2) return `${lessonsPart} · ${rabbi.cities.length} ערים`;
  return lessonsPart;
};

// The heading's second line names "the nearest date" as a promise about
// ordering, so the rows are sorted defensively here rather than trusted
// blind: a pure, in-memory sort, not a second network call.
export const sortByDate = (items: LessonOccurrence[]): LessonOccurrence[] =>
  [...items].sort((a, b) => (a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)));
