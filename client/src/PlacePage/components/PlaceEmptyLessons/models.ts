import type { LessonOccurrence } from '@torabarabim/common';

export interface PlaceEmptyLessonsProps {
  className?: string;
  cityName: string;
  widenedItems: LessonOccurrence[] | undefined;
  isWidenedPending: boolean;
  isWidenedError: boolean;
}
