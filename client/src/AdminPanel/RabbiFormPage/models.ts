import type { RabbiProminence } from '@torabarabim/common';

export interface RabbiFormPageProps {
  className?: string;
}

export interface RabbiFormState {
  name: string;
  title: string;
  bio: string;
  // The rabbi's title/bio as loaded from the server, so a save can tell
  // "cleared" (had a value, now blank: send `null`) apart from "never had
  // one" (blank from the start: omit the key). Undefined for a new rabbi,
  // where there is nothing to clear.
  existingTitle: string | undefined;
  existingBio: string | undefined;
  photoFile: File | undefined;
  existingPhotoUrl: string | undefined;
  prominence: RabbiProminence;
}

export type RabbiFormField = 'name' | 'photo';
export type RabbiFormErrors = Partial<Record<RabbiFormField, string>>;

export type SaveRabbiStep = 'name' | 'photo';
