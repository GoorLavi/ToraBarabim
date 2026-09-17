import type { SelectedCity } from '~/components/CitySelect/models';
import type { OccurrenceRowData } from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/models';

export interface MoveExceptionSheetProps {
  className?: string;
  lessonId: string;
  row: OccurrenceRowData;
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
