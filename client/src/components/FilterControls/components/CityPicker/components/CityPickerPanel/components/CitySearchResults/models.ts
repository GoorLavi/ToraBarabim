import type { SelectedCity } from '~/hooks/models';

import type { CitySearchViewState } from '../../../../models';

export interface CitySearchResultsProps {
  className?: string;
  search: CitySearchViewState;
  onSelect: (city: SelectedCity) => void;
  onBackToList: () => void;
}
