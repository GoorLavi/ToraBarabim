import type { LessonAudience } from '@torabarabim/common';

export interface LessonPreviewCardProps {
  className?: string;
  rabbiName: string | undefined;
  rabbiPhotoUrl: string | undefined;
  title: string;
  audience: LessonAudience | undefined;
  cityName: string | undefined;
  weekdayLabel: string | undefined;
  startTime: string;
}
