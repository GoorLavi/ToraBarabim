export type GalleryPhotoStatus = 'uploaded' | 'uploading' | 'failed';

export interface GalleryPhoto {
  id: string;
  url: string;
  status: GalleryPhotoStatus;
}

export interface GalleryFieldProps {
  className?: string;
  photos: GalleryPhoto[];
  onAddFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}
