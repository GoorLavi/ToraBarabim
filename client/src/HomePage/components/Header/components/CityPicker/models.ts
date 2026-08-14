import type { SelectedCity } from '~/HomePage/models';

export interface CityPickerProps {
  className?: string;
  city: SelectedCity | undefined;
  onSelectCity: (city: SelectedCity) => void;
}
