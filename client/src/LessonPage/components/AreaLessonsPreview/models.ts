import type { AreaPreview, AreaPreviewLessons } from '~/LessonPage/models';

export interface AreaLessonsPreviewProps {
  className?: string;
  areaPreview: AreaPreview;
}

export interface ResolvedAreaLessonsPreviewProps {
  className?: string;
  areaName: string;
  areaSlug: string;
  lessons: AreaPreviewLessons;
}
