export type PhotoPickerUploadStatus = 'uploading' | 'failed';

// '3:4' is every rabbi's portrait poster, the only ratio this component
// carried until a place's own photo needed a landscape frame instead.
// Optional, defaulting to '3:4': `PlacePanel/ProfilePage` (owned by another
// slice) already calls this component without the prop, and a required prop
// would fail its build. See the report for this slice.
export type PhotoPickerAspectRatio = '3:4' | '16:9';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CropRect extends ImageDimensions {
  x: number;
  y: number;
}

// `zoom` is relative to the scale at which the source image just covers the
// viewport (1 is the widest crop the floor allows, never below it); `offset`
// is the image's own top-left corner in viewport pixels, always zero or
// negative on both axes so the image can never show a gap.
export interface CropTransform {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

// The file a person just picked for the '16:9' path, once it has been
// confirmed to clear the crop floor and is ready for the crop step: the
// object URL is kept alive (and revoked) for exactly as long as this is set.
export interface CropCandidate {
  file: File;
  objectUrl: string;
  dimensions: ImageDimensions;
}

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
