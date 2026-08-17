export interface PhotoPickerProps {
  className?: string;
  previewUrl: string | undefined;
  hasExistingPhoto: boolean;
  onSelectFile: (file: File) => void;
  errorMessage: string | undefined;
}
