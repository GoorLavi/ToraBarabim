export type PhotoPickerUploadStatus = 'uploading' | 'failed';

// '3:4' is every rabbi's portrait poster, the only ratio this component
// carried until a place's own photo needed a landscape frame instead.
// Optional, defaulting to '3:4': `PlacePanel/ProfilePage` (owned by another
// slice) already calls this component without the prop, and a required prop
// would fail its build. See the report for this slice.
export type PhotoPickerAspectRatio = '3:4' | '16:9';

export interface PhotoPickerProps {
  className?: string;
  previewUrl: string | undefined;
  hasExistingPhoto: boolean;
  onSelectFile: (file: File) => void;
  errorMessage: string | undefined;
  aspectRatio?: PhotoPickerAspectRatio;
  // Additive: real upload progress driven by the parent, used by the
  // rabbi profile screen, which uploads immediately on file selection and
  // keeps the previous photo visible until the upload either succeeds or
  // fails. Left undefined by the admin rabbi form, which only uploads a
  // photo when the whole form is saved (`RabbiFormPage/useSaveRabbi.ts`),
  // so its picker never enters either state and renders exactly as before.
  uploadStatus?: PhotoPickerUploadStatus;
  onRetryUpload?: () => void;
}
