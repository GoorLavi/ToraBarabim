import type { RabbiProminence } from '@torabarabim/common';

export interface RabbiFormPageProps {
  className?: string;
}

export interface RabbiFormState {
  name: string;
  photoFile: File | undefined;
  existingPhotoUrl: string | undefined;
  prominence: RabbiProminence;
}

export type RabbiFormField = 'name' | 'photo';
export type RabbiFormErrors = Partial<Record<RabbiFormField, string>>;

export type SaveRabbiStep = 'name' | 'photo';
