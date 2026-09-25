export interface ViewablePhoto {
  id: string;
  url: string;
}

export interface PhotoViewerProps {
  className?: string;
  courseName: string;
  photos: ViewablePhoto[];
  activeIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onDismiss: () => void;
}
