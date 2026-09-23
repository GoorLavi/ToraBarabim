import type { ImageDimensions } from '../../models';

export interface PhotoCropStepProps {
  className?: string;
  // Kept alongside the object URL so a canvas failure on confirm (helpers.ts
  // comment) can hand the original file to the caller instead of trapping
  // the person on a crop screen with no way forward.
  file: File;
  imageUrl: string;
  sourceDimensions: ImageDimensions;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}

export interface Point {
  x: number;
  y: number;
}
