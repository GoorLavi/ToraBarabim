export interface LessonsGridSkeletonProps {
  className?: string;
  cellCount: number;
  // Mirrors LessonsGrid's own `maxColumns`, so a caller that caps the loaded
  // grid's column count passes the same value here and the two never
  // disagree on layout while the preview is still loading.
  maxColumns?: number;
}
