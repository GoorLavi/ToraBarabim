import { lessonCountLabel } from '~/consts';
import { NO_LESSONS_META_LABEL } from '~/PlacePage/consts';

// `undefined` while the count is not yet known, so the caller renders
// nothing rather than a placeholder (PlaceHero.tsx): the head never waits
// on the lessons fetch to paint (design spec, "Loading").
export const placeMetaLabel = (lessonCount: number | undefined): string | undefined => {
  if (lessonCount === undefined) return undefined;
  return lessonCount === 0 ? NO_LESSONS_META_LABEL : lessonCountLabel(lessonCount);
};
