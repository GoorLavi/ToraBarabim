import type { LessonAudience, Rabbi } from '@torabarabim/common';

export interface LessonPreviewCardProps {
  className?: string;
  rabbi: Rabbi | undefined;
  title: string;
  audience: LessonAudience | undefined;
  cityName: string | undefined;
  weekdayLabel: string | undefined;
  startTime: string;
}
