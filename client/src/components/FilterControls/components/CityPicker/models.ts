import type { SelectedCity } from '~/hooks/models';

export interface CityPickerProps {
  className?: string;
  city: SelectedCity | undefined;
  onSelectCity: (city: SelectedCity) => void;
  onClearCity: () => void;
}
