export type GalleryPhotoStatus = 'uploaded' | 'uploading' | 'failed';

export interface GalleryPhoto {
  id: string;
  url: string;
  status: GalleryPhotoStatus;
  // Set only when `status` is 'failed': the approved reason a rejected
  // photo cannot be added, shown instead of the generic failure line.
  // `canRetry` is false for a rejection that will fail the same way again
  // (too small, the gallery already full) and true for a genuine network
  // failure.
  failureReason?: string;
  canRetry?: boolean;
}

export interface GalleryFieldProps {
  className?: string;
  photos: GalleryPhoto[];
  onAddFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}
