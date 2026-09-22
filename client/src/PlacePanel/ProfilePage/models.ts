import type { SelectedCity } from '~/components/CitySelect/models';

export interface ProfilePageProps {
  className?: string;
}

// `existingFloor` is the value as loaded from the server, so a save can tell
// "cleared" (had a value, now blank: send `null`) apart from "never had one"
// (blank from the start: omit the key), the same three-state shape as
// `RabbiPanel/ProfilePage/models.ts`'s `existingTitle`/`existingBio`. `name`,
// `street` and `city` are never nullable on `UpdatePlaceProfileRequest`, so
// they need no such tracking.
export interface ProfileFormState {
  name: string;
  street: string;
  floor: string;
  existingFloor: string | undefined;
  city: SelectedCity | undefined;
}

export type ProfileFormField = 'name' | 'street' | 'city';
export type ProfileFormErrors = Partial<Record<ProfileFormField, string>>;
