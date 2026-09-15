export interface CityPickerStateBlockAction {
  label: string;
  style: 'primary' | 'quiet';
  onClick: () => void;
}

export interface CityPickerStateBlockProps {
  className?: string;
  title?: string;
  danger?: boolean;
  body: string;
  actions?: CityPickerStateBlockAction[];
}
