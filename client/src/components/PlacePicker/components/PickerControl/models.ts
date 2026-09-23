import type { PickedPlace } from '~/components/PlacePicker/models';

export interface PickerControlProps {
  className?: string;
  place: PickedPlace | undefined;
  onSelectPlace: (place: PickedPlace) => void;
  onClearPlace: () => void;
}
