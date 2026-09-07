export type PhotoPickerUploadStatus = 'uploading' | 'failed';

export interface PhotoPickerProps {
  className?: string;
  previewUrl: string | undefined;
  hasExistingPhoto: boolean;
  onSelectFile: (file: File) => void;
  errorMessage: string | undefined;
  // Additive: real upload progress driven by the parent, used by the
  // rabbi profile screen, which uploads immediately on file selection and
  // keeps the previous photo visible until the upload either succeeds or
  // fails. Left undefined by the admin rabbi form, which only uploads a
  // photo when the whole form is saved (`RabbiFormPage/useSaveRabbi.ts`),
  // so its picker never enters either state and renders exactly as before.
  uploadStatus?: PhotoPickerUploadStatus;
  onRetryUpload?: () => void;
}
