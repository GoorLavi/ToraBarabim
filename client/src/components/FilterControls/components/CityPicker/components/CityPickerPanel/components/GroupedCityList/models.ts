import type { Area } from '@torabarabim/common';

import type { SelectedCity } from '~/hooks/models';

import type { CitySuggestionsViewState } from '../../../../models';

export interface GroupedCityListProps {
  className?: string;
  suggestions: CitySuggestionsViewState;
  recentCities: SelectedCity[];
  expandedAreaCodes: ReadonlySet<Area>;
  onExpandArea: (area: Area) => void;
  onSelect: (city: SelectedCity) => void;
}
