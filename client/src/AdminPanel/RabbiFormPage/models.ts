export interface RabbiFormPageProps {
  className?: string;
}

export interface RabbiFormState {
  name: string;
  photoFile: File | undefined;
  existingPhotoUrl: string | undefined;
}

export type RabbiFormField = 'name' | 'photo';
export type RabbiFormErrors = Partial<Record<RabbiFormField, string>>;

export type SaveRabbiStep = 'name' | 'photo';
