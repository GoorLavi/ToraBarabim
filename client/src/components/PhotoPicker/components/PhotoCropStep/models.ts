import type { ImageDimensions } from '../../models';

export interface PhotoCropStepProps {
  className?: string;
  // Kept alongside the object URL so a canvas failure on confirm (helpers.ts
  // comment) can hand the original file to the caller instead of trapping
  // the person on a crop screen with no way forward.
  file: File;
  imageUrl: string;
  sourceDimensions: ImageDimensions;
  // The ratio to crop to and the floor that bounds how far zoom can go
  // (helpers.ts, `windowSizeForStage` and `hasNoFramingRoom`), both
  // `PhotoPicker`'s own values: this component knows nothing of '3:4' or
  // '16:9' as concepts, only the numbers.
  aspectRatio: number;
  minWidth: number;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}

export interface Point {
  x: number;
  y: number;
}
