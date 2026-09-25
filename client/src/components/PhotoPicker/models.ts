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
  // The floor a caller's own photo must clear: shown in the help text for
  // every ratio, and fed to the crop step's own math for the one ratio that
  // opens it ('16:9' today). No default: a caller with no real floor of its
  // own would be a defect to leave silent, not a case worth a fallback for.
  minWidth: number;
  minHeight: number;
  // Additive: real upload progress driven by the parent, used by the
  // rabbi profile screen, which uploads immediately on file selection and
  // keeps the previous photo visible until the upload either succeeds or
  // fails. Left undefined by the admin rabbi form, which only uploads a
  // photo when the whole form is saved (`RabbiFormPage/useSaveRabbi.ts`),
  // so its picker never enters either state and renders exactly as before.
  uploadStatus?: PhotoPickerUploadStatus;
  onRetryUpload?: () => void;
  // Replaces `consts.PHOTO_HELP_CROP[aspectRatio]`'s own line for a caller
  // whose crop sentence is not about a rabbi's portrait: the course cover
  // is '3:4' too, but has no face to keep off the edge. Omitted, every
  // '3:4' or '16:9' caller keeps the shared line exactly as before.
  cropHelpOverride?: string;
  // '16:9' already checks a picked file's own dimensions before it ever
  // reaches `onSelectFile` (the crop step needs to know it can produce a
  // crop at the floor). A '3:4' caller opts into the same pre-check with
  // this flag: the rabbi poster has no server-side floor to fail against
  // and keeps rejecting nothing here, but the course cover does.
  enforceFloor?: boolean;
  // A course cannot be saved without a cover, so its own empty state has
  // nothing analogous to the "a soft background shows in its place" a rabbi
  // or a place gets meanwhile. Omitted, every caller keeps the shared line.
  missingPhotoNoteOverride?: string;
  // The shared failure line's second sentence ("the previous photo stayed
  // on the site") only makes sense once a previous photo exists to have
  // stayed: false on a brand-new course, which has no cover yet to fall
  // back to. Omitted (undefined), every caller keeps the full two-sentence
  // line exactly as before.
  hasPreviousPhotoOnFailure?: boolean;
  // The approved reason a rejected upload failed (spec section 13), shown
  // instead of the generic failure line. Undefined for a plain network
  // failure, which keeps the generic line.
  failureReasonOverride?: string;
}
