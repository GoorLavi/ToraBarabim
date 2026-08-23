export interface ProfilePageProps {
  className?: string;
}

// `existingTitle`/`existingBio` are the values as loaded from the server,
// so a save can tell "cleared" (had a value, now blank: send `null`) apart
// from "never had one" (blank from the start: omit the key). Undefined
// until the profile has loaded.
export interface ProfileFormState {
  name: string;
  title: string;
  bio: string;
  existingTitle: string | undefined;
  existingBio: string | undefined;
}

export type ProfileFormField = 'name';
export type ProfileFormErrors = Partial<Record<ProfileFormField, string>>;
