import type { AudienceFilter } from '@torabarabim/common';

import type { DateFilterOption, SelectedCity } from '~/hooks/models';

export interface FilterControlsProps {
  className?: string;
  option: DateFilterOption;
  customDate: string | undefined;
  onSelectOption: (option: Exclude<DateFilterOption, 'custom' | 'all'>) => void;
  onSelectCustomDate: (isoDate: string) => void;
  onClearDate: () => void;
  city: SelectedCity | undefined;
  onSelectCity: (city: SelectedCity) => void;
  onClearCity: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  audienceFilter: AudienceFilter | undefined;
  onSelectAudienceFilter: (filter: AudienceFilter) => void;
  onClearAudienceFilter: () => void;
}
