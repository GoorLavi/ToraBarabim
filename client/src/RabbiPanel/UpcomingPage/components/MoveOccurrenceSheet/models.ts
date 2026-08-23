import type { SelectedCity } from '~/components/CitySelect/models';
import type { UpcomingOccurrence } from '~/RabbiPanel/UpcomingPage/models';

export interface MoveOccurrenceSheetProps {
  className?: string;
  occurrence: UpcomingOccurrence;
  onDismiss: () => void;
}

export interface MoveFormState {
  startTime: string;
  placeOverrideEnabled: boolean;
  city: SelectedCity | undefined;
  placeName: string;
  street: string;
}

export type MoveFormField = 'startTime' | 'city' | 'placeName' | 'street';
export type MoveFormErrors = Partial<Record<MoveFormField, string>>;
