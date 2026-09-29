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
  // The form's own save is in flight (the create request itself, or the
  // draft uploads after it): the add tile takes no new photos meanwhile, or
  // one picked here could still be a fresh, unwatched pending photo by the
  // time `uploadDraftsAfterCreate` has already gathered and started
  // uploading everything it knows about (reviewer finding L1).
  isSaving: boolean;
}
