import type { SelectedCity } from '~/hooks/models';

export interface RecentCitiesProps {
  className?: string;
  cities: SelectedCity[];
  onSelect: (city: SelectedCity) => void;
}
