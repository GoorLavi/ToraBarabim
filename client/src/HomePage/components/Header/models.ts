import type { DateFilterOption, SelectedCity } from '~/HomePage/models';

export interface HeaderProps {
  className?: string;
  option: DateFilterOption;
  customDate: string | undefined;
  onSelectOption: (option: Exclude<DateFilterOption, 'custom'>) => void;
  onSelectCustomDate: (isoDate: string) => void;
  city: SelectedCity | undefined;
  onSelectCity: (city: SelectedCity) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}
