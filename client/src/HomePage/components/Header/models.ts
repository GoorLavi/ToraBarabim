import type { DateFilterOption, SelectedCity } from '~/HomePage/models';

export interface HeaderProps {
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
}
