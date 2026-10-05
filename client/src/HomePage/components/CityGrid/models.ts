import type { CityWithLessonCount } from '@torabarabim/common';

import type { SelectedCity } from '~/hooks/models';

export interface CityGridProps {
  className?: string;
  cities: CityWithLessonCount[] | undefined;
  isLoading: boolean;
  isError: boolean;
  selectedCityId: string | undefined;
  onSelectCity: (city: SelectedCity) => void;
  onClearCity: () => void;
}
