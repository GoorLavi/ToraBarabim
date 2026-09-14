import type { LessonOccurrence } from '@torabarabim/common';

export interface CityEmptyStateProps {
  className?: string;
  cityName: string;
  areaName: string;
  areaSlug: string;
  areaItems: LessonOccurrence[] | undefined;
  isAreaPending: boolean;
  isAreaError: boolean;
}
