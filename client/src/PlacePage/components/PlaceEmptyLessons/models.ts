import type { LessonOccurrence } from '@torabarabim/common';

export interface PlaceEmptyLessonsProps {
  className?: string;
  cityName: string;
  widenedItems: LessonOccurrence[] | undefined;
  isWidenedPending: boolean;
  isWidenedError: boolean;
  // The second widening step's own target (design gate finding F2):
  // `undefined` until the city-widening call above resolves, since the
  // area's label and slug only come off that same hop.
  areaName: string | undefined;
  areaSlug: string | undefined;
  areaItems: LessonOccurrence[] | undefined;
  isAreaPending: boolean;
  isAreaError: boolean;
}
