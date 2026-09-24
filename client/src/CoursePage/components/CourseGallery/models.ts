export interface GalleryPhoto {
  id: string;
  url: string;
}

export interface CourseGalleryProps {
  className?: string;
  courseName: string;
  // The cover first, then the gallery photos, upload order (spec section
  // 9): the one place this component reads a course's images from, so a
  // caller never has to know the cover is really `photos[0]`.
  photos: GalleryPhoto[];
}
