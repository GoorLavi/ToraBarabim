import type { CitySearchResult } from '@torabarabim/common';

import type { SelectedCity } from '~/hooks/models';

export interface CitySearchResultsListProps {
  className?: string;
  items: CitySearchResult[];
  onSelect: (city: SelectedCity) => void;
}
