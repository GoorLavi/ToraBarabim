import type { SelectedCity } from '~/components/CitySelect/models';

export interface PlaceFormPageProps {
  className?: string;
}

export interface PlaceFormState {
  name: string;
  city: SelectedCity | undefined;
  street: string;
  floor: string;
  // The floor as loaded from the server, so a save can tell "cleared" (had
  // a value, now blank: send `null`) apart from "never had one" (blank from
  // the start: omit the key). Undefined for a new place.
  existingFloor: string | undefined;
  photoFile: File | undefined;
  existingPhotoUrl: string | undefined;
  // Edit mode only: a new place is always created active. The entire
  // deactivate/reactivate mechanism (root CLAUDE.md, no delete route),
  // toggled through the same save as every other field.
  isActive: boolean;
}

export type PlaceFormField = 'name' | 'city' | 'street' | 'photo';
export type PlaceFormErrors = Partial<Record<PlaceFormField, string>>;

export type SavePlaceStep = 'fields' | 'photo';
