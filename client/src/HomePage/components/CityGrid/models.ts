import type { LessonOccurrence } from '@torabarabim/common';

import type { SelectedCity } from '~/HomePage/models';

export interface CityGridProps {
  className?: string;
  items: LessonOccurrence[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onSelectCity: (city: SelectedCity) => void;
}
