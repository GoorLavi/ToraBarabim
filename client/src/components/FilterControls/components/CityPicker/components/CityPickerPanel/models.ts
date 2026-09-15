import type { SelectedCity } from '~/hooks/models';

export interface CityPickerPanelProps {
  className?: string;
  isDrawer: boolean;
  isWide: boolean;
  recentCities: SelectedCity[];
  onSelect: (city: SelectedCity) => void;
  onClose: () => void;
}
