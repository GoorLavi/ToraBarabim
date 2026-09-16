import type { CityAreaSuggestionGroup } from '@torabarabim/common';

import type { SelectedCity } from '~/hooks/models';

export interface CityAreaBlockProps {
  className?: string;
  areaGroup: CityAreaSuggestionGroup;
  isExpanded: boolean;
  onExpand: () => void;
  onSelect: (city: SelectedCity) => void;
}
