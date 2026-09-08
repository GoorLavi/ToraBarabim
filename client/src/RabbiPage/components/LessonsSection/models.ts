import type { LessonOccurrence } from '@torabarabim/common';

export interface LessonsSectionProps {
  className?: string;
  showSubheading: boolean;
  items: LessonOccurrence[] | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
}
