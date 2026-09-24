import type { GalleryPhoto } from '../../models';

export interface PhotoViewerProps {
  className?: string;
  courseName: string;
  photos: GalleryPhoto[];
  activeIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onDismiss: () => void;
}
