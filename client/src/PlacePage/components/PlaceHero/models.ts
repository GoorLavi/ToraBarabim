import type { Place } from '@torabarabim/common';

export interface PlaceHeroProps {
  className?: string;
  place: Place;
  // `undefined` while the lessons count is not yet known (the head never
  // waits on the lessons fetch to paint): the meta line simply does not
  // render until it is (PlaceHero.tsx, PlaceHero/helpers.ts).
  lessonCount: number | undefined;
}
